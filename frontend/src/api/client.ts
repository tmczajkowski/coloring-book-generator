export type HistoryItem = { id: string; createdAt: number; prompt: string; imageUrl?: string };

const parseTimeout = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

// Prefer OPENAI_TIMEOUT_MS (build-time) or VITE_OPENAI_TIMEOUT_MS as initial default; updated via /api/config at runtime
let OPENAI_TIMEOUT = parseTimeout(
  (import.meta.env as any).OPENAI_TIMEOUT_MS ?? (import.meta.env as any).VITE_OPENAI_TIMEOUT_MS,
  60000
);

export const setTimeoutMs = (ms: number) => {
  OPENAI_TIMEOUT = parseTimeout(ms, OPENAI_TIMEOUT);
};

export const loadConfig = async () => {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) return;
    const data = await res.json();
    if (data && typeof data.openaiTimeoutMs === 'number') {
      setTimeoutMs(data.openaiTimeoutMs);
    }
  } catch {}
};

const withTimeout = async <T>(fn: (signal: AbortSignal) => Promise<T>, ms = 30000): Promise<T> => {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    return await fn(ac.signal);
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new Error(`Przekroczono czas oczekiwania (${Math.round(ms / 1000)}s)`);
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
};

const postJson = async <T>(url: string, body: any, timeoutMs?: number): Promise<T> =>
  withTimeout(async (signal) => {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
    if (!res.ok) throw new Error(await safeText(res));
    return res.json();
  }, timeoutMs);

const safeText = async (res: Response) => {
  try { return await res.text(); } catch { return `${res.status} ${res.statusText}`; }
};

export const api = {
  loadConfig,
  setTimeoutMs,
  async transcribe(audio: Blob): Promise<{ id: string; prompt: string }> {
    const form = new FormData();
    form.append('audio', audio, 'audio.webm');
    return withTimeout(async (signal) => {
      const res = await fetch('/api/transcribe', { method: 'POST', body: form, signal });
      if (!res.ok) throw new Error(await safeText(res));
      return res.json();
    }, OPENAI_TIMEOUT);
  },
  async generate(id: string, prompt: string): Promise<{ imageUrl: string; thumbUrl: string }>{
    return postJson('/api/generate', { id, prompt }, OPENAI_TIMEOUT);
  },
  async print(id: string): Promise<{ jobId: string }>{
    return postJson('/api/print', { id });
  },
  async history(): Promise<HistoryItem[]>{
    return withTimeout(async (signal) => {
      const res = await fetch('/api/history', { signal });
      if (!res.ok) throw new Error(await safeText(res));
      return res.json();
    });
  },
  async remove(id: string): Promise<{ ok: true }>{
    return withTimeout(async (signal) => {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE', signal });
      if (!res.ok) throw new Error(await safeText(res));
      return res.json();
    });
  }
};
