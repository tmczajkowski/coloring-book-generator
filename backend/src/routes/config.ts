import { Router, type Request, type Response } from 'express';
import { config } from '../config.js';

export const configRouter = Router();

configRouter.get('/', (_req: Request, res: Response) => {
  const expectedEnv = [
    'OPENAI_API_KEY',
    'GEMINI_API_KEY',
    'PRINTER_URI'
  ];
  const missingEnv = expectedEnv.filter((k) => !process.env[k]);
  const canGenerate = !!config.geminiApiKey; // blokujemy generowanie bez klucza Gemini
  res.json({
    openaiTimeoutMs: config.openaiTimeoutMs,
    imageModel: config.geminiImageModel,
    geminiAspectRatio: config.geminiAspectRatio,
    imageReferencesModel: config.imageReferencesModel,
    textModel: config.textModel,
    sttModel: config.sttModel,
    printerUri: config.printerUri,
    missingEnv,
    canGenerate,
  });
});
