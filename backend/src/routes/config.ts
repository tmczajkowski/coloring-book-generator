import { Router, type Request, type Response } from 'express';
import { config } from '../config.js';

export const configRouter = Router();

configRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    openaiTimeoutMs: config.openaiTimeoutMs,
    imageModel: config.imageModel,
    textModel: config.textModel,
    sttModel: config.sttModel,
    printerUri: config.printerUri,
  });
});
