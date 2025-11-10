import { Router, type Request, type Response } from 'express';
import { improvePrompt } from '../services/openai.js';
import { createSession, getSessionDir } from '../services/storage.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { isValidId } from '../utils/validation.js';

export const improveRouter = Router();

improveRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { id, prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Brak promptu' });
    let sessionId: string = id;
    if (!sessionId) {
      sessionId = await createSession();
    } else if (!isValidId(sessionId)) {
      return res.status(400).json({ error: 'Nieprawidłowe id' });
    } else {
      const dir = getSessionDir(sessionId);
      const metaPath = path.join(dir, 'meta.json');
      if (!fs.existsSync(metaPath)) {
        await createSession(sessionId);
      }
    }
    logger.info('Ulepszanie promptu: start', { id: sessionId, prompt });
    const improved = await improvePrompt(prompt);
    try {
      const dir = getSessionDir(sessionId);
      fs.writeFileSync(path.join(dir, 'prompt_improved.txt'), improved);
    } catch {}
    res.json({ id: sessionId, improved });
  } catch (e: any) {
    logger.error('Ulepszanie promptu: błąd', e);
    res.status(500).json({ error: e?.message || 'Improve error' });
  }
});

