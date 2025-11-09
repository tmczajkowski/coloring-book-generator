import { Router, type Request, type Response } from 'express';
import { savePrompt, saveImageBuffer } from '../services/storage.ts';
import { generateImage } from '../services/openai.ts';
const placeholderPng = () => Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGD4DwABGQEBd1e9twAAAABJRU5ErkJggg==','base64');

export const generateRouter = Router();

generateRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { id, prompt } = req.body || {};
    if (!id || !prompt) return res.status(400).json({ error: 'Brak id lub promptu' });
    await savePrompt(id, prompt);
    try {
      const pngBuffer = await generateImage(prompt);
      const buffer = pngBuffer.length > 0 ? pngBuffer : placeholderPng();
      const imgPath = await saveImageBuffer(id, buffer, 'png');
      res.json({ imageUrl: `/files/${id}/image.png`, thumbUrl: `/files/${id}/image.png`, path: imgPath });
    } catch {
      const imgPath = await saveImageBuffer(id, placeholderPng(), 'png');
      res.json({ imageUrl: `/files/${id}/image.png`, thumbUrl: `/files/${id}/image.png`, path: imgPath });
    }
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Generate error' });
  }
});
