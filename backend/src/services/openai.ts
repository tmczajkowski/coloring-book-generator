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
  form.append('model', 'whisper-1');
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
    // Fallback: return empty buffer to signal placeholder path
    return Buffer.from([]);
  }
  const p = `Narysuj czarno-białą ilustrację do kolorowania (line art, wyraźne kontury, bez tła, brak szarości, brak cieniowania), temat: ${prompt}. Styl przyjazny dla dzieci.`;
  logger.info('OpenAI: image generation prompt', { original: prompt, composed: p, model: config.imageModel || 'gpt-image-1', size: OPENAI_IMAGE_SIZE, quality: OPENAI_IMAGE_QUALITY });
  // simple retry for transient errors (2 retries)
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
        // do not retry on 400 range (except 429)
        if (res.status !== 429 && res.status < 500) {
          throw new Error(`OpenAI image failed: ${res.status} ${text}`);
        }
        throw new Error(`OpenAI image transient: ${res.status} ${text}`);
      }
      const data: any = await res.json();
      const b64 = data?.data?.[0]?.b64_json;
      if (!b64) throw new Error('Brak danych obrazu z OpenAI');
      return Buffer.from(b64, 'base64');
    } catch (e: any) {
      lastErr = e;
      logger.warn('OpenAI: image attempt failed', { attempt, error: String(e?.message || e) });
      if (attempt < 2) await delay(500 * Math.pow(2, attempt));
    }
  }
  throw lastErr || new Error('OpenAI image failed');
};
