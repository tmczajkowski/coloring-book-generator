import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import { createSession, saveAudio, savePrompt } from '../services/storage.ts';
import { transcribeAudio } from '../services/openai.ts';
import { logger } from '../utils/logger.ts';

const upload = multer({ storage: multer.memoryStorage() });

export const transcribeRouter = Router();

transcribeRouter.post('/', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Brak pliku audio' });
    const id = await createSession();
    logger.info('Transkrypcja: start', { id, size: req.file.size, mimetype: req.file.mimetype });
    const ext = path.extname(req.file.originalname || '.webm').replace('.', '') || 'webm';
    const audioPath = await saveAudio(id, req.file.buffer, ext);
    const prompt = await transcribeAudio(audioPath);
    logger.info('Transkrypcja: wynik', { id, prompt });
    await savePrompt(id, prompt);
    res.json({ id, prompt });
  } catch (e: any) {
    logger.error('Transkrypcja: błąd', e);
    res.status(500).json({ error: e?.message || 'Transcribe error' });
  }
});
