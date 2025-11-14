import fs from 'fs/promises';
import path from 'path';
import mime from 'mime-types';
import { GoogleGenerativeAI, type GenerateContentResult, type Part } from '@google/generative-ai';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

type GenerateOptions = { qualityOverride?: string };

const ensureClient = () => {
  if (!config.geminiApiKey) {
    throw new Error('Brak konfiguracji GEMINI_API_KEY');
  }
  return new GoogleGenerativeAI(config.geminiApiKey);
};

const getModel = () => {
  const client = ensureClient();
  return client.getGenerativeModel({
    model: config.geminiImageModel,
  });
};

const buildPrompt = (subject: string, quality?: string) => {
  const base = `${config.promptColoringBook} '${subject}'`;
  if (!quality) return base;
  return `${base}. Prefer ${quality} detail and crisp lines.`;
};

const loadReferenceParts = async (fileNames: string[]): Promise<Part[]> => {
  const parts: Part[] = [];
  for (const name of fileNames) {
    const absPath = path.join(config.referenceDir, name);
    try {
      const data = await fs.readFile(absPath);
      const resolvedMime = mime.lookup(name);
      const mimeType = typeof resolvedMime === 'string' ? resolvedMime : 'image/jpeg';
      parts.push({
        inlineData: {
          data: data.toString('base64'),
          mimeType,
        },
      });
      logger.info('Gemini: reference prepared', { fileName: name, bytes: data.byteLength });
    } catch (error: any) {
      logger.warn('Gemini: failed to read reference image', { fileName: name, absPath, error: String(error?.message || error) });
    }
  }
  return parts;
};

const extractInlineImage = (result: GenerateContentResult): string | undefined => {
  const candidates = result.response?.candidates ?? [];
  for (const candidate of candidates) {
    const parts = candidate.content?.parts ?? [];
    for (const part of parts) {
      const inline = part.inlineData;
      if (inline?.data) return inline.data;
    }
  }
  return undefined;
};

const generateWithGemini = async (subject: string, references: string[] | undefined, opts?: GenerateOptions) => {
  const model = getModel();
  const prompt = buildPrompt(subject, opts?.qualityOverride);
  const referenceParts = references?.length ? await loadReferenceParts(references) : [];
  const parts: Part[] = [...referenceParts, { text: prompt }];

  if (referenceParts.length === 0 && references?.length) {
    throw new Error('Brak dostępnych referencji do przesłania do Gemini');
  }

  logger.info('Gemini: generate call', {
    subject,
    prompt,
    referencesRequested: references?.length || 0,
    referencesAttached: referenceParts.length,
    model: config.geminiImageModel,
  });

  const start = Date.now();
  const result = await model.generateContent({
    contents: [{ role: 'user', parts }],
  });
  const blocked = result.response?.promptFeedback?.blockReason;
  if (blocked && blocked !== 'BLOCKED_REASON_UNSPECIFIED') {
    logger.warn('Gemini: request blocked', { subject, reason: blocked });
    throw new Error('Żądanie zostało zablokowane przez system bezpieczeństwa Gemini. Zmień prompt i spróbuj ponownie.');
  }
  const data = extractInlineImage(result);
  logger.info('Gemini: generate finished', { durationMs: Date.now() - start });
  if (!data) {
    throw new Error('Brak danych obrazu z Gemini');
  }
  return Buffer.from(data, 'base64');
};

export const generateImage = async (subject: string, opts?: GenerateOptions) => {
  return generateWithGemini(subject, undefined, opts);
};

export const generateImageWithReferences = async (subject: string, fileNames: string[], opts?: GenerateOptions) => {
  if (!fileNames.length) throw new Error('Brak referencji do Gemini');
  return generateWithGemini(subject, fileNames, opts);
};
