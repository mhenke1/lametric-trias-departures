import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { TriasService } from './services/triasService';
import { formatForLametric } from './utils/lametricFormatter';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const triasService = new TriasService({
  endpoint: process.env.TRIAS_ENDPOINT!,
  token: process.env.TRIAS_TOKEN!,
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/departures/:stationId', async (req: Request, res: Response) => {
  try {
    const departures = await triasService.getDepartures(req.params.stationId);
    if (!departures || departures.length === 0) {
      console.warn('No departures found for station:', req.params.stationId);
      res.status(200).json({"frames":[{"text":"Keine Abfahrten gefunden","icon":"bus"}]});
    } else {
    const lametricResponse = formatForLametric(departures);
    res.status(200).json(lametricResponse);
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(200).json({"frames":[{"text":"Keine Abfahrten gefunden","icon":"bus"}]});
  }
});

app.get('/api/trmnl/:stationId', async (req: Request, res: Response) => {
  const secret = process.env.TRMNL_TOKEN;
  if (secret && req.query.token !== secret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const departures = await triasService.getDepartures(req.params.stationId);
    const lines: Record<string, string[]> = {};
    for (const d of departures || []) {
      (lines[d.line] ||= []).push(d.time);
    }
    res.status(200).json({
      station: req.params.stationId,
      departures: departures || [],
      lines: Object.entries(lines).map(([line, times]) => ({ line, times: times.slice(0, 4) })),
    });
  } catch (error) {
    console.error('Error handling TRMNL request:', error);
    res.status(200).json({ station: req.params.stationId, departures: [], lines: [] });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});