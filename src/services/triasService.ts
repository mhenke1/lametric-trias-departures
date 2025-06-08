import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import NodeCache from 'node-cache';
import { TriasConfig, BusDeparture } from '../types/types';

export class TriasService {
  private config: TriasConfig;
  private cache: NodeCache;

  constructor(config: TriasConfig) {
    this.config = config;
    // Initialize cache with 5 minutes TTL
    this.cache = new NodeCache({ stdTTL: 300 }); // 300 seconds = 5 minutes
  }

  async getDepartures(stationId: string): Promise<BusDeparture[]> {
    // Try to get from cache first
    const cachedData = this.cache.get<BusDeparture[]>(stationId);
    if (cachedData) {
      console.log('Cache hit for station:', stationId);
      return cachedData;
    }
    
    console.log('Cache miss for station:', stationId);
    // If not in cache, fetch from TRIAS API
    const requestXml = this.createStopEventRequest(stationId);
    try {
      const response = await axios.post(this.config.endpoint, requestXml, {
        headers: {
          'Content-Type': 'application/xml',
        }
      });

      const departures = await this.parseTriasResponse(response.data);

      // Store in cache
      this.cache.set(stationId, departures);

      return departures;
    } catch (error) {
      console.error('Error fetching departures:', error);
      throw error;
    }
  }

  private createStopEventRequest(stationId: string): string {
    return `
      <?xml version="1.0" encoding="UTF-8"?>
    <Trias version="1.2" xmlns="http://www.vdv.de/trias" xmlns:siri="http://www.siri.org.uk/siri">
    <ServiceRequest>
        <siri:RequestorRef>${this.config.token}</siri:RequestorRef>
        <RequestPayload>
        <StopEventRequest>
            <Location>
            <LocationRef>
                <StopPointRef>${stationId}</StopPointRef>
            </LocationRef>
            </Location>
            <Params>
            <NumberOfResults>20</NumberOfResults>
            <StopEventType>departure</StopEventType>
            <IncludePreviousCalls>false</IncludePreviousCalls>
            <IncludeOnwardCalls>false</IncludeOnwardCalls>
            <IncludeRealtimeData>true</IncludeRealtimeData>
            </Params>
        </StopEventRequest>
        </RequestPayload>
    </ServiceRequest>
    </Trias>
    `;
  }

  private async parseTriasResponse(xml: string): Promise<BusDeparture[]> {
    try {
      const result = await parseStringPromise(xml, {
        explicitArray: false,
        ignoreAttrs: true,
        tagNameProcessors: [
          (name) => name.replace('trias:', '').replace('siri:', '')
        ]
      });

      const stopEvents = result.Trias?.ServiceDelivery?.DeliveryPayload?.StopEventResponse?.StopEventResult || [];

      if (!Array.isArray(stopEvents)) {
        console.log('Single stop event received, wrapping in array');
        return [this.parseSingleStopEvent(stopEvents)].filter(Boolean) as BusDeparture[];
      }

      return stopEvents
        .map(event => this.parseSingleStopEvent(event))
        .filter(Boolean) as BusDeparture[];
    } catch (error) {
      console.error('Error parsing TRIAS response:', error);
      throw new Error('Failed to parse TRIAS response');
    }
  }

  private parseSingleStopEvent(event: any): BusDeparture | null {
    try {
      const serviceInfo = event?.StopEvent?.Service?.ServiceSection?.PublishedLineName?.Text;
      const time = event?.StopEvent?.ThisCall?.CallAtStop?.ServiceDeparture?.EstimatedTime || event?.StopEvent?.ThisCall?.CallAtStop?.ServiceDeparture?.TimetabledTime;

      if (!serviceInfo || !time) {
        return null;
      }

      const departureTime = new Date(time);
      const timeString = departureTime.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      });

      return {
        line: serviceInfo,
        time: timeString
      };
    } catch (error) {
      console.error('Error parsing single stop event:', error);
      return null;
    }
  }
}