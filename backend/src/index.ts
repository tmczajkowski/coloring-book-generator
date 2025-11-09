import express, { type Request, type Response } from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config.ts';
import { logger } from './utils/logger.ts';
import { initStorage } from './services/storage.ts';
import { transcribeRouter } from './routes/transcribe.ts';
import { generateRouter } from './routes/generate.ts';
import { printRouter } from './routes/print.ts';
import { historyRouter } from './routes/history.ts';

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// API routes
app.use('/api/transcribe', transcribeRouter);
app.use('/api/generate', generateRouter);
app.use('/api/print', printRouter);
app.use('/api/history', historyRouter);

// Static files from data dir
app.use('/files', express.static(config.dataDir));

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

initStorage().then(() => {
  app.listen(config.port, () => {
    logger.info(`Backend listening on http://localhost:${config.port}`);
  });
});
