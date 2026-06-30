import fs from 'fs/promises';
import path from 'path';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { detectReferencesWithGemini } from './gemini-text.js';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export type ReferenceDetectionResult = {
  references: string[]; // file names chosen by AI
  available: string[];  // all available file names in referenceDir
};

export const listReferenceFiles = async (): Promise<string[]> => {
  try {
    const entries = await fs.readdir(config.referenceDir, { withFileTypes: true });
    const files = entries
      .filter(e => e.isFile())
      .map(e => e.name)
      .filter(name => IMAGE_EXTS.has(path.extname(name).toLowerCase()));
    return files;
  } catch (e) {
    logger.warn('References: failed to read referenceDir, treating as empty', { dir: config.referenceDir, error: String((e as any)?.message || e) });
    return [];
  }
};

export const detectReferences = async (userPrompt: string): Promise<ReferenceDetectionResult> => {
  const available = await listReferenceFiles();
  if (available.length === 0) return { references: [], available };

  logger.info('References: detect start', { count: available.length });
  try {
    const refs = await detectReferencesWithGemini(userPrompt, available, config.promptDetectReferences);
    logger.info('References: detect result', { references: refs });
    return { references: refs, available };
  } catch (e: any) {
    const msg = String(e?.message || e);
    logger.error('References: detection API error', { error: msg });
    throw new Error('Błąd wyszukiwania referencji');
  }
};
