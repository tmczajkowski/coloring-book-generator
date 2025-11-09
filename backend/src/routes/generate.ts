import { Router, type Request, type Response } from 'express';
import { savePrompt, saveImageBuffer } from '../services/storage.ts';
import { generateImage } from '../services/openai.ts';
import { logger } from '../utils/logger.ts';
const placeholderPng = () => Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGD4DwABGQEBd1e9twAAAABJRU5ErkJggg==','base64');

export const generateRouter = Router();

generateRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { id, prompt } = req.body || {};
    if (!id || !prompt) return res.status(400).json({ error: 'Brak id lub promptu' });
    logger.info('Generowanie: start', { id, prompt });
    await savePrompt(id, prompt);
    try {
      const pngBuffer = await generateImage(prompt);
      const buffer = pngBuffer.length > 0 ? pngBuffer : placeholderPng();
      const imgPath = await saveImageBuffer(id, buffer, 'png');
      logger.info('Generowanie: zapisano obraz', { id, path: imgPath });
      res.json({ imageUrl: `/files/${id}/image.png`, thumbUrl: `/files/${id}/image.png`, path: imgPath });
    } catch {
      const imgPath = await saveImageBuffer(id, placeholderPng(), 'png');
      logger.warn('Generowanie: błąd, zapisano placeholder', { id, path: imgPath });
      res.json({ imageUrl: `/files/${id}/image.png`, thumbUrl: `/files/${id}/image.png`, path: imgPath });
    }
  } catch (e: any) {
    logger.error('Generowanie: błąd', e);
    res.status(500).json({ error: e?.message || 'Generate error' });
  }
});
