import fs from 'fs/promises';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { OPENAI_IMAGE_SIZE, OPENAI_IMAGE_QUALITY } from '../constants.js';

const OPENAI_BASE = 'https://api.openai.com/v1';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit & { timeoutMs?: number } = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), init.timeoutMs ?? config.openaiTimeoutMs);
  try {
    const res = await fetch(input, { ...init, signal: ac.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

export const transcribeAudio = async (audioPath: string): Promise<string> => {
  if (!config.openaiApiKey) {
    // Fallback for local testing without API key
    return 'Smok, zamek i rycerz';
  }
  const fileBuf = await fs.readFile(audioPath);
  logger.info('OpenAI: transcribe call', { audioPath, bytes: fileBuf.byteLength });

  const blob = new Blob([fileBuf], { type: 'audio/webm' });
  const form = new FormData();
  form.append('file', blob, 'audio.webm');
  form.append('model', config.sttModel || 'whisper-1');
  // Force Polish language for better accuracy with Polish speech
  form.append('language', 'pl');

  const res = await fetchWithTimeout(`${OPENAI_BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.openaiApiKey}` },
    body: form
  });
  if (!res.ok) throw new Error(`OpenAI transcribe failed: ${res.status} ${await res.text()}`);
  const data: any = await res.json();
  return data.text || '';
};

export const generateImage = async (prompt: string): Promise<Buffer> => {
  if (!config.openaiApiKey) {
    throw new Error('Brak konfiguracji OPENAI_API_KEY');
  }
  const p = `Narysuj czarno-białą ilustrację do kolorowania (line art, wyraźne kontury, bez tła, brak szarości, brak cieniowania), temat: ${prompt}. Styl przyjazny dla dzieci.`;
  logger.info('OpenAI: image generation prompt', { original: prompt, composed: p, model: config.imageModel || 'gpt-image-1', size: OPENAI_IMAGE_SIZE, quality: OPENAI_IMAGE_QUALITY });
  // simple retry for transient errors (2 retries). Do NOT retry user errors (e.g., moderation).
  let lastErr: any;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetchWithTimeout(`${OPENAI_BASE}/images/generations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.imageModel || 'gpt-image-1',
          prompt: p,
          size: OPENAI_IMAGE_SIZE,
          quality: OPENAI_IMAGE_QUALITY
        })
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        // Mark 429/5xx as transient; 4xx as non-retryable (user error)
        if (res.status === 429 || res.status >= 500) {
          throw new Error(`OpenAI image transient: ${res.status} ${text}`);
        } else {
          // e.g. moderation_blocked
          throw new Error(`OpenAI image failed: ${res.status} ${text}`);
        }
      }
      const data: any = await res.json();
      const b64 = data?.data?.[0]?.b64_json;
      if (!b64) throw new Error('Brak danych obrazu z OpenAI');
      return Buffer.from(b64, 'base64');
    } catch (e: any) {
      const msg = String(e?.message || e);
      lastErr = e;
      logger.warn('OpenAI: image attempt failed', { attempt, error: msg });
      // Only retry transient errors
      const isTransient = msg.includes('transient');
      if (!isTransient) throw e;
      if (attempt < 2) await delay(500 * Math.pow(2, attempt));
    }
  }
  throw lastErr || new Error('OpenAI image failed');
};

export const improvePrompt = async (original: string): Promise<string> => {
  if (!config.openaiApiKey) {
    // Fallback for local dev: return original prompt
    return original;
  }
  const system = 'Jesteś asystentem, który ulepsza krótkie prompty do generowania czarno-białych kolorowanek (line art). Zwracaj wyłącznie ulepszony prompt, bez cudzysłowów, bez komentarzy.';
  const user = `Ulepsz ten prompt tak, aby powstała kolorowanka dla dzieci: \n\n"${original}"\n\nWymagania: czarno-biała grafika liniowa, wyraźne (grubsze) kontury, brak tła, brak szarości i cieniowania, centralna kompozycja, przyjazny styl, dużo elementów do kolorowania.`;
  logger.info('OpenAI: improve prompt call', { original });
  const res = await fetchWithTimeout(`${OPENAI_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.textModel || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.7,
      max_tokens: 200
    })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI improve failed: ${res.status} ${text}`);
  }
  const data: any = await res.json();
  const improved: string | undefined = data?.choices?.[0]?.message?.content?.trim();
  if (!improved) throw new Error('Brak treści ulepszonego promptu');
  return improved;
};
