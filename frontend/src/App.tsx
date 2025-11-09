import React, { useEffect, useRef, useState } from 'react';
import { api, HistoryItem } from './api/client';

type Status = 'idle' | 'recording' | 'transcribing' | 'generating' | 'printing' | 'done' | 'error';

export const App: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [prompt, setPrompt] = useState('');
  const [id, setId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => { refreshHistory(); }, []);

  const refreshHistory = async () => {
    try { setHistory(await api.history()); } catch {}
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setStatus('transcribing');
        try {
          const { id, prompt } = await api.transcribe(blob);
          setId(id);
          setPrompt(prompt);
          setStatus('generating');
          const gen = await api.generate(id, prompt);
          setImageUrl(gen.imageUrl);
          setStatus('printing');
          await api.print(id);
          setStatus('done');
          await refreshHistory();
        } catch (e) {
          console.error(e);
          setStatus('error');
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setStatus('recording');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
  };

  const cancelRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setStatus('idle');
  };

  const canRecord = status === 'idle' || status === 'error' || status === 'done';

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, Arial' }}>
      <aside style={{ width: 260, borderRight: '1px solid #eee', padding: 12, overflow: 'auto' }}>
        <h3>Historia</h3>
        {history.map(item => (
          <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: 6, padding: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>{new Date(item.createdAt).toLocaleString()}</div>
            <div style={{ fontSize: 13, margin: '6px 0' }}>{item.prompt}</div>
            {item.imageUrl && (
              <a href={item.imageUrl} target="_blank" rel="noreferrer">podgląd</a>
            )}
          </div>
        ))}
      </aside>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={canRecord ? startRecording : undefined}
            disabled={!canRecord}
            style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              border: 'none',
              background: canRecord ? '#ff3b30' : '#ccc',
              color: 'white',
              fontSize: 18,
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
            }}
            title="Nagraj prompt głosowy"
          >
            🎤
          </button>
          {status === 'recording' && (
            <div style={{ marginTop: 16 }}>
              <button onClick={stopRecording} style={{ marginRight: 8, background: '#34c759', color: '#fff', padding: '8px 12px', borderRadius: 6, border: 'none' }}>Stop</button>
              <button onClick={cancelRecording} style={{ background: '#ff9f0a', color: '#fff', padding: '8px 12px', borderRadius: 6, border: 'none' }}>Kosz</button>
            </div>
          )}

          {status !== 'idle' && status !== 'recording' && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', padding: 24, borderRadius: 12, width: 480, maxWidth: '90%' }}>
                <h2 style={{ marginTop: 0 }}>Przetwarzanie…</h2>
                <ol>
                  <li style={{ color: status === 'transcribing' ? '#111' : '#666' }}>Transkrypcja</li>
                  <li style={{ color: status === 'generating' ? '#111' : '#666' }}>Generowanie obrazu</li>
                  <li style={{ color: status === 'printing' ? '#111' : '#666' }}>Drukowanie</li>
                </ol>
                {status === 'done' && (
                  <div>
                    <p>Gotowe! {imageUrl && (<a href={imageUrl} target="_blank" rel="noreferrer">Podgląd</a>)} </p>
                    <button onClick={() => setStatus('idle')}>Zamknij</button>
                  </div>
                )}
                {status === 'error' && (
                  <div>
                    <p>Wystąpił błąd. Spróbuj ponownie.</p>
                    <button onClick={() => setStatus('idle')}>Zamknij</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

