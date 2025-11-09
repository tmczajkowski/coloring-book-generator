import { Router, type Request, type Response } from 'express';
import { savePrompt, saveImageBuffer } from '../services/storage.ts';
import { generateImage } from '../services/openai.ts';
import { logger } from '../utils/logger.ts';
import sharp from 'sharp';
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
      const source = pngBuffer.length > 0 ? pngBuffer : placeholderPng();
      const jpg = await sharp(source).flatten({ background: { r: 255, g: 255, b: 255 } }).jpeg({ quality: 95 }).toBuffer();
      const imgPath = await saveImageBuffer(id, jpg, 'jpg');
      logger.info('Generowanie: zapisano obraz', { id, path: imgPath });
      res.json({ imageUrl: `/files/${id}/image.jpg`, thumbUrl: `/files/${id}/image.jpg`, path: imgPath });
    } catch {
      const jpg = await sharp(placeholderPng()).flatten({ background: { r: 255, g: 255, b: 255 } }).jpeg({ quality: 90 }).toBuffer();
      const imgPath = await saveImageBuffer(id, jpg, 'jpg');
      logger.warn('Generowanie: błąd, zapisano placeholder', { id, path: imgPath });
      res.json({ imageUrl: `/files/${id}/image.jpg`, thumbUrl: `/files/${id}/image.jpg`, path: imgPath });
    }
  } catch (e: any) {
    logger.error('Generowanie: błąd', e);
    res.status(500).json({ error: e?.message || 'Generate error' });
  }
});
