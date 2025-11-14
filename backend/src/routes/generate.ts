import { Router, type Request, type Response } from 'express';
import { saveImageBuffer, createSession, getSessionDir, readMeta, updateMeta } from '../services/storage.js';
import { generateImage, generateImageWithReferences } from '../services/gemini.js';
import { logger } from '../utils/logger.js';
import { EXT_PNG, FILE_IMAGE_PNG } from '../constants.js';
import fs from 'fs';
import path from 'path';
import { isValidId } from '../utils/validation.js';
import { config } from '../config.js';

export const generateRouter = Router();

generateRouter.post('/', async (req: Request, res: Response) => {
  try {
    if (!config.geminiApiKey) {
      return res.status(503).json({ error: 'Brak konfiguracji GEMINI_API_KEY – generowanie zablokowane.' });
    }
    const { id, prompt } = req.body || {};
    if (!id || !prompt) return res.status(400).json({ error: 'Brak id lub promptu' });
    if (!isValidId(id)) return res.status(400).json({ error: 'Nieprawidłowe id' });
    logger.info('Generation: start', { id, prompt });
    const dir = getSessionDir(id);
    const metaPath = path.join(dir, 'meta.json');
    if (!fs.existsSync(metaPath)) {
      await createSession(id);
    }
    // Nie nadpisuj podstawowego promptu (pochodzi z transkrypcji).
    // Jeśli meta.prompt istnieje i różni się od przekazanego promptu, zapisz jako improvedPrompt.
    // Jeśli meta.prompt nie istnieje, zapisz nowy prompt jako podstawowy.
    try {
      const meta = await readMeta(id);
      if (meta?.prompt && meta.prompt !== prompt) {
        await updateMeta(id, { improvedPrompt: prompt });
      } else if (!meta?.prompt) {
        await updateMeta(id, { prompt });
      }
    } catch {}
    try {
      const meta = await readMeta(id);
      const refs: string[] = Array.isArray(meta?.references) ? meta.references : [];
      let pngBuffer: Buffer;
      if (refs.length > 0) {
        try {
          pngBuffer = await generateImageWithReferences(prompt, refs);
        } catch (e: any) {
          logger.error('Generation: reference mode failed', {
            id,
            references: refs,
            error: e?.message || String(e),
          });
          throw e;
        }
      } else {
        pngBuffer = await generateImage(prompt);
      }
      
      const imgPath = await saveImageBuffer(id, pngBuffer, EXT_PNG);
      logger.info('Generation: image saved', { id, path: imgPath });
      res.json({ imageUrl: `/files/${id}/${FILE_IMAGE_PNG}`, thumbUrl: `/files/${id}/${FILE_IMAGE_PNG}`, path: imgPath });
    } catch (e: any) {
      const msg = String(e?.message || e);
      const normalized = msg.toLowerCase();
      if (msg.includes('moderation_blocked') || normalized.includes('safety system') || normalized.includes('system bezpieczeństwa')) {
        logger.warn('Generation: rejected by AI', { id, error: msg });
        return res.status(400).send('Żądanie zostało zablokowane przez system bezpieczeństwa Gemini. Zmień prompt i spróbuj ponownie.');
      }
      throw e;
    }
  } catch (e: any) {
    logger.error('Generation: error', e);
    res.status(500).json({ error: e?.message || 'Generate error' });
  }
});
