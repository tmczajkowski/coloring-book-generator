import { Router, type Request, type Response } from 'express';
import { listHistory } from '../services/storage.ts';

export const historyRouter = Router();

historyRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await listHistory();
    res.json(items);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'History error' });
  }
});
