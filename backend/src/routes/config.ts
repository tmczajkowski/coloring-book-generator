import { Router, type Request, type Response } from 'express';
import { config } from '../config.js';

export const configRouter = Router();

configRouter.get('/', (_req: Request, res: Response) => {
  const expectedEnv = [
    'OPENAI_API_KEY',
    'PRINTER_URI',
    'DATA_DIR',
    'OPENAI_IMAGE_MODEL',
    'OPENAI_TEXT_MODEL',
    'OPENAI_STT_MODEL',
    'OPENAI_TIMEOUT_MS'
  ];
  const missingEnv = expectedEnv.filter((k) => !process.env[k]);
  const canGenerate = !!config.openaiApiKey; // blokujemy generowanie bez klucza
  res.json({
    openaiTimeoutMs: config.openaiTimeoutMs,
    imageModel: config.imageModel,
    textModel: config.textModel,
    sttModel: config.sttModel,
    printerUri: config.printerUri,
    missingEnv,
    canGenerate,
  });
});
