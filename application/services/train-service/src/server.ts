import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { seedData } from '../../database/seed/seed.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

// In-memory data store with caching emulation
let trains = JSON.parse(JSON.stringify(seedData.trains));
const stations = seedData.stations;

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', service: 'train-service', timestamp: new Date().toISOString() });
});

app.get('/metrics', (req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP train_search_queries_total Total search queries
train_search_queries_total 3540
# HELP train_catalog_cache_hits_total Redis cache hits
train_catalog_cache_hits_total 3120
`);
});

// GET /api/trains
app.get('/api/trains', (req: Request, res: Response) => {
  return res.json({ trains, total: trains.length });
});

// GET /api/trains/search
app.get('/api/trains/search', (req: Request, res: Response) => {
  const { from, to, date, class: trainClass } = req.query;

  let results = trains;
  if (from) {
    results = results.filter((t: any) =>
      t.originCode.toLowerCase() === String(from).toLowerCase() ||
      t.schedule.some((s: any) => s.stationCode.toLowerCase() === String(from).toLowerCase())
    );
  }
  if (to) {
    results = results.filter((t: any) =>
      t.destCode.toLowerCase() === String(to).toLowerCase() ||
      t.schedule.some((s: any) => s.stationCode.toLowerCase() === String(to).toLowerCase())
    );
  }
  if (trainClass && trainClass !== 'ALL') {
    results = results.filter((t: any) =>
      t.coaches.some((c: any) => c.coachClass === trainClass)
    );
  }

  return res.json({
    from,
    to,
    date,
    count: results.length,
    trains: results
  });
});

// GET /api/trains/:id
app.get('/api/trains/:id', (req: Request, res: Response) => {
  const train = trains.find((t: any) => t.trainNumber === req.params.id || t.name.toLowerCase().includes(req.params.id.toLowerCase()));
  if (!train) return res.status(404).json({ error: 'Train not found' });
  return res.json({ train });
});

// GET /api/trains/:id/schedule
app.get('/api/trains/:id/schedule', (req: Request, res: Response) => {
  const train = trains.find((t: any) => t.trainNumber === req.params.id);
  if (!train) return res.status(404).json({ error: 'Train not found' });
  return res.json({ trainNumber: train.trainNumber, trainName: train.name, schedule: train.schedule });
});

// Admin: Add train
app.post('/api/trains', (req: Request, res: Response) => {
  const newTrain = { ...req.body, id: `tr-${Date.now()}` };
  trains.push(newTrain);
  return res.status(201).json({ message: 'Train added successfully', train: newTrain });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`[train-service] Running on port ${PORT}`));
}

export default app;
