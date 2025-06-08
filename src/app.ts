import express, { Request, Response } from 'express';
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});