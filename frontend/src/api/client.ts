export type HistoryItem = { id: string; createdAt: number; prompt: string; imageUrl?: string };

const postJson = async <T>(url: string, body: any): Promise<T> => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const api = {
  async transcribe(audio: Blob): Promise<{ id: string; prompt: string }> {
    const form = new FormData();
    form.append('audio', audio, 'audio.webm');
    const res = await fetch('/api/transcribe', { method: 'POST', body: form });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async generate(id: string, prompt: string): Promise<{ imageUrl: string; thumbUrl: string }>{
    return postJson('/api/generate', { id, prompt });
  },
  async print(id: string): Promise<{ jobId: string }>{
    return postJson('/api/print', { id });
  },
  async history(): Promise<HistoryItem[]>{
    const res = await fetch('/api/history');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};

