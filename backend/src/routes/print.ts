import { Router, type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import { getSessionDir, markPrinted } from '../services/storage.ts';
import { printFile } from '../services/printer.ts';

export const printRouter = Router();

printRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Brak id' });
    const dir = getSessionDir(id);
    const candidates = ['image.png'];
    const existing = candidates.map(name => path.join(dir, name)).find(p => fs.existsSync(p));
    if (!existing) return res.status(404).json({ error: 'Brak obrazu do druku (image.png/svg/pdf nie istnieje)' });
    const jobId = await printFile(existing);
    await markPrinted(id);
    res.json({ jobId, file: path.basename(existing) });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Print error' });
  }
});
