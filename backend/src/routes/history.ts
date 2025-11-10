import { Router, type Request, type Response } from 'express';
import { deleteSession, listHistory } from '../services/storage.ts';

export const historyRouter = Router();

historyRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await listHistory();
    res.json(items);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'History error' });
  }
});

historyRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) return res.status(400).json({ error: 'Brak id' });
    await deleteSession(id);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Delete error' });
  }
});
