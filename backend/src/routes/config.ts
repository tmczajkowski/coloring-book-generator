import { Router, type Request, type Response } from 'express';
import { config } from '../config.js';

export const configRouter = Router();

configRouter.get('/', (_req: Request, res: Response) => {
  res.json({ openaiTimeoutMs: config.openaiTimeoutMs });
});

