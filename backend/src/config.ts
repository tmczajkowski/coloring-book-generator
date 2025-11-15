import dotenv from 'dotenv';
import path from 'path';
import * as constants from './constants.js';

// Load .env from current working dir and also try parent dir (repo root)
dotenv.config();
try {
  const parentEnv = path.resolve(process.cwd(), '..', '.env');
  dotenv.config({ path: parentEnv });
} catch {}

export const config = {
  port: Number(process.env.PORT) || 3000,
  dataDir: path.resolve(process.env.DATA_DIR || '../data'),
  referenceDir: path.resolve(process.env.REFERENCE_DIR || '../reference'),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiImageModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
  geminiAspectRatio: process.env.GEMINI_IMAGE_ASPECT_RATIO || '2:3',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  printerUri: process.env.PRINTER_URI || '',
  imageReferencesModel: process.env.OPENAI_IMAGE_REFERENCES_MODEL || 'gpt-5',
  textModel: process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini',
  sttModel: process.env.OPENAI_STT_MODEL || 'whisper-1',
  openaiTimeoutMs: Number(process.env.OPENAI_TIMEOUT_MS || 240000),
  // Prompts with environment variable overrides
  promptColoringBook: process.env.PROMPT_COLORING_BOOK || constants.PROMPT_COLORING_BOOK,
  promptImprove: process.env.PROMPT_IMPROVE || constants.PROMPT_IMPROVE,
  promptDetectReferences: process.env.PROMPT_DETECT_REFERENCES || constants.PROMPT_DETECT_REFERENCES,
};
