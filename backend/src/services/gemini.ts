import fs from 'fs/promises';
import path from 'path';
import mime from 'mime-types';
import { GoogleGenerativeAI, type GenerateContentResult, type Part } from '@google/generative-ai';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

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

const buildPrompt = (subject: string) => `${config.promptColoringBook} '${subject}'`;

const buildContents = (prompt: string, referenceParts: Part[]) => [{
  role: 'user',
  parts: [
    { text: prompt },
    ...referenceParts,
  ],
}];

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

const summarizeParts = (parts: Part[] = []) => parts.map((part) => {
  if (part.inlineData) {
    return `inline(${part.inlineData?.mimeType || 'unknown'} len=${part.inlineData?.data?.length || 0})`;
  }
  if ((part as any).text) {
    const txt = String((part as any).text);
    return `text(${txt.slice(0, 60)}${txt.length > 60 ? '…' : ''})`;
  }
  if ((part as any).fileData) return 'fileData';
  if ((part as any).functionCall) return 'functionCall';
  return 'unknown';
});

type GeminiOptions = { aspectRatio?: string };

const generateWithGemini = async (subject: string, references: string[] | undefined, opts?: GeminiOptions) => {
  const model = getModel();
  const prompt = buildPrompt(subject);
  const referenceParts = references?.length ? await loadReferenceParts(references) : [];
  const parts: Part[] = [...referenceParts, { text: prompt }];

  if (referenceParts.length === 0 && references?.length) {
    throw new Error('Brak dostępnych referencji do przesłania do Gemini');
  }

  const effectiveAspect = opts?.aspectRatio || config.geminiAspectRatio;

  logger.info('Gemini: generate call', {
    subject,
    prompt,
    referencesRequested: references?.length || 0,
    referencesAttached: referenceParts.length,
    model: config.geminiImageModel,
    aspectRatio: effectiveAspect || 'default',
  });

  const generationConfig: Record<string, any> = {
    responseModalities: ['Image'],
  };
  if (effectiveAspect) {
    generationConfig.imageConfig = { aspectRatio: effectiveAspect };
  }

  const maxAttempts = references?.length ? 2 : 1;
  let lastResult: GenerateContentResult | null = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const start = Date.now();
    const result = await model.generateContent({
      contents: buildContents(prompt, referenceParts),
      generationConfig: generationConfig as any,
    });
    lastResult = result;
    const blocked = result.response?.promptFeedback?.blockReason;
    if (blocked && blocked !== 'BLOCKED_REASON_UNSPECIFIED') {
      logger.warn('Gemini: request blocked', { subject, reason: blocked });
      throw new Error('Żądanie zostało zablokowane przez system bezpieczeństwa Gemini. Zmień prompt i spróbuj ponownie.');
    }
    const data = extractInlineImage(result);
    logger.info('Gemini: generate finished', { durationMs: Date.now() - start, attempt });
    if (data) {
      return Buffer.from(data, 'base64');
    }
    const candidatesSummary = (result.response?.candidates ?? []).map((candidate: any, idx: number) => ({
      index: idx,
      finishReason: candidate.finishReason,
      partKinds: summarizeParts(candidate.content?.parts ?? []),
    }));
    const finishReasons = candidatesSummary.map((c) => c.finishReason || 'unknown');
    const firstText = (result.response?.candidates ?? [])
      .flatMap((c: any) => (c.content?.parts ?? []))
      .map((part: any) => part?.text)
      .find((txt) => typeof txt === 'string' && txt.trim().length > 0);
    const shouldRetry = attempt + 1 < maxAttempts && finishReasons.every((fr) => fr !== 'IMAGE_BLOCKED' && fr !== 'IMAGE_OTHER');
    if (shouldRetry) {
      logger.warn('Gemini: missing inline data, retrying', {
        attempt,
        finishReasons,
        hasHint: Boolean(firstText),
        result
      });
      continue;
    }

    if (finishReasons.includes('IMAGE_OTHER')) {
      logger.error('Gemini: missing inline image data due to inconsistent prompt', {
        subject,
        finishReasons,
      });
      throw new Error(`Nie udało się wygenerować obrazu, błąd: ${finishReasons} Spróbuj uprościć lub przeformułować swój pomysł.`);
    }

    logger.error('Gemini: missing inline image data', {
      subject,
      promptFeedback: result.response?.promptFeedback,
      candidatesSummary,
      finishReasons,
      hint: firstText?.slice(0, 200),
    });
    const hintText = firstText ? ` Wskazówka od modelu: ${firstText.slice(0, 200)}` : '';
    const reasonText = finishReasons.length ? ` (powód: ${finishReasons.join(', ')})` : '';
    throw new Error('Brak danych obrazu z Gemini' + reasonText + '.' + hintText);
  }
  throw new Error('Brak danych obrazu z Gemini');
};

export const generateImage = async (subject: string, opts?: GeminiOptions) => {
  return generateWithGemini(subject, undefined, opts);
};

export const generateImageWithReferences = async (subject: string, fileNames: string[], opts?: GeminiOptions) => {
  if (!fileNames.length) throw new Error('Brak referencji do Gemini');
  return generateWithGemini(subject, fileNames, opts);
};
