import fs from 'fs/promises';
import mime from 'mime-types';
import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const getClient = () =>
  new GoogleGenAI({
    apiKey: config.geminiApiKey,
    httpOptions: { apiVersion: 'v1beta' },
  });

const getModel = () => config.geminiTextModel;

export const transcribeAudio = async (audioPath: string): Promise<string> => {
  if (!config.geminiApiKey) {
    return 'Smok, zamek i rycerz';
  }

  const fileBuf = await fs.readFile(audioPath);
  const resolvedMime = mime.lookup(audioPath);
  const mimeType = typeof resolvedMime === 'string' ? resolvedMime : 'audio/webm';

  logger.info('Gemini STT: transcribe call', { audioPath, bytes: fileBuf.byteLength, mimeType });

  const client = getClient();
  const response = await client.models.generateContent({
    model: getModel(),
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'Transkrybuj poniższe nagranie audio do tekstu w języku polskim. Zwróć wyłącznie transkrypcję, bez żadnych dodatkowych komentarzy.' },
          { inlineData: { mimeType, data: fileBuf.toString('base64') } },
        ],
      },
    ],
  });

  const text = response.text?.trim() ?? '';
  logger.info('Gemini STT: result', { text });
  if (!text) throw new Error('Brak transkrypcji od Gemini');
  return text;
};

export const improvePrompt = async (original: string): Promise<string> => {
  if (!config.geminiApiKey) {
    return original;
  }

  const userPrompt = config.promptImprove + " '" + original + "'";
  logger.info('Gemini improve: call', { original });

  const client = getClient();
  const response = await client.models.generateContent({
    model: getModel(),
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
  });

  const improved = response.text?.trim() ?? '';
  logger.info('Gemini improve: result', { improved });
  if (!improved) throw new Error('Brak treści ulepszonego promptu');
  return improved;
};

export const detectReferencesWithGemini = async (
  userPrompt: string,
  availableFiles: string[],
  promptTemplate: string,
): Promise<string[]> => {
  if (!config.geminiApiKey || availableFiles.length === 0) return [];

  const list = availableFiles.join(', ');
  const fullPrompt = `${promptTemplate}. Available Files: '${list}'. Prompt z którego wykryjesz referencje (postacie): '${userPrompt}'. Odpowiedz wyłącznie poprawnym JSON-em w formacie: {"references": ["plik1.jpg"]}`;

  logger.info('Gemini references: detect call', { availableFiles, userPrompt });

  const client = getClient();
  const response = await client.models.generateContent({
    model: getModel(),
    config: { responseMimeType: 'application/json' },
    contents: [
      {
        role: 'user',
        parts: [{ text: fullPrompt }],
      },
    ],
  });

  const raw = response.text?.trim() ?? '';
  logger.info('Gemini references: raw response', { raw });

  try {
    const parsed = JSON.parse(raw) as { references?: string[] };
    const refs = (parsed.references ?? []).filter((name) => availableFiles.includes(name));
    logger.info('Gemini references: result', { refs });
    return refs;
  } catch (e) {
    logger.error('Gemini references: JSON parse error', { raw, error: String(e) });
    throw new Error('Błąd parsowania JSON z Gemini');
  }
};
