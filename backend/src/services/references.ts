import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import * as constants from '../constants.js';
import { createOpenAIClient } from './openai.js';

const referenceSchema = z.object({
  references: z.array(z.string()),
});
type ReferenceSchemaType = z.infer<typeof referenceSchema>;

const buildReferenceSystemMessage = () =>
  'You are a reference selector. Respond only with a JSON object that strictly follows the provided schema ({ references: string[] }) and nothing else. Do not explain anything, do not add prose, and do not hallucinate values.';

const buildReferenceUserMessage = (prompt: string, files: string[]) => {
  const list = files.length ? files.join(', ') : 'brak';
  const basePrompt = config.promptDetectReferences || constants.PROMPT_DETECT_REFERENCES;
  return `${basePrompt}. Prompt: '${prompt}'. Files: ${list}.`;
};

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
  if (!config.openaiApiKey) {
    return { references: [], available };
  }
  if (available.length === 0) return { references: [], available };

  const client = createOpenAIClient();
  logger.info('References: detect start', { count: available.length });
  try {
    const response = await client.responses.parse({
      model: config.textModel,
      temperature: 0,
      input: [
        { role: 'system', content: buildReferenceSystemMessage() },
        { role: 'user', content: buildReferenceUserMessage(userPrompt, available) },
      ],
      text: {
        format: zodTextFormat(referenceSchema, 'reference_detection'),
      },
    } as any);

    if (response.status === 'incomplete') {
      logger.warn('References: incomplete response', { reason: response.incomplete_details?.reason });
      throw new Error('Niekompletna odpowiedź od AI');
    }

    const parsed = response.output_parsed as ReferenceSchemaType | undefined;
    logger.info('Parsed references', { references: parsed?.references });

    if (!parsed) {
      logger.warn('References: missing parsed JSON', { parsed, output: response.output_text });
      throw new Error('Brak prawidłowego JSON-a od AI');
    }

    const refs = parsed.references.filter((name) => available.includes(name));
    logger.info('References: detect result', { references: refs });
    return { references: refs, available };
  } catch (e: any) {
    const msg = String(e?.message || e);
    logger.error('References: detection API error', { error: msg });
    throw new Error('Błąd wyszukiwania referencji');
  }
};
