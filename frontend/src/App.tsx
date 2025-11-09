import React, { useEffect, useRef, useState } from 'react';
import { api, HistoryItem } from './api/client';
  import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    Stack,
    Button,
    Fab,
    Switch,
    FormControlLabel,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stepper,
    Step,
    StepLabel,
      Alert,
  } from '@mui/material';
  import MicIcon from '@mui/icons-material/Mic';
  import PrintIcon from '@mui/icons-material/Print';
  import { keyframes } from '@mui/system';

type Status = 'idle' | 'recording' | 'transcribing' | 'generating' | 'printing' | 'done' | 'error';

export const App: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [prompt, setPrompt] = useState('');
  const [id, setId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  // Auto print state synced with URL param `auto-print` and persisted to localStorage
  const [autoPrint, setAutoPrint] = useState<boolean>(() => {
    const sp = new URLSearchParams(window.location.search);
    const v = sp.get('auto-print');
    if (v != null) return v === 'true';
    try {
      const saved = localStorage.getItem('autoPrint');
      if (saved != null) return saved === 'true';
    } catch {}
    return true;
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => { refreshHistory(); }, []);

  // Keep URL and localStorage in sync with autoPrint state
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    sp.set('auto-print', String(autoPrint));
    const url = `${window.location.pathname}?${sp.toString()}`;
    window.history.replaceState({}, '', url);
    try { localStorage.setItem('autoPrint', String(autoPrint)); } catch {}
  }, [autoPrint]);

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
          if (autoPrint) {
            setStatus('printing');
            try {
              await api.print(id);
            } catch (e) {
              console.error('Print failed:', e);
              // Continue to done even if printing fails, image is ready
            }
          }
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
  const pulse = keyframes`
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,71,111, 0.4); }
    70% { transform: scale(1.04); box-shadow: 0 0 0 18px rgba(239,71,111, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,71,111, 0); }
  `;

  const steps = autoPrint
    ? ['Transkrypcja', 'Generowanie obrazu', 'Drukowanie']
    : ['Transkrypcja', 'Generowanie obrazu'];
  const activeStep =
    status === 'transcribing' ? 0 :
    status === 'generating' ? 1 :
    (autoPrint && status === 'printing' ? 2 : steps.length); // done/error

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar position="fixed" color="primary" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Generator kolorowanek
          </Typography>
          <Tooltip title={autoPrint ? 'Automatyczne drukowanie włączone' : 'Kolorowanki nie będą drukowane automatycznie'} arrow>
            <FormControlLabel
              labelPlacement="start"
              control={
                <Switch
                  checked={autoPrint}
                  onChange={(e) => setAutoPrint(e.target.checked)}
                  color={autoPrint ? 'success' : 'error'}
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      color: autoPrint ? 'success.main' : 'error.main',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'success.main',
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: autoPrint ? 'success.main' : 'error.main',
                    },
                  }}
                />
              }
              label={<PrintIcon fontSize="small" />}
              sx={{
                ml: 2,
                color: 'common.white',
                '& .MuiFormControlLabel-label': { color: 'inherit' },
              }}
            />
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Box component="aside" sx={{ width: 320, borderRight: 1, borderColor: 'divider', p: 2, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>Historia</Typography>
          <List dense>
            {history.map(item => (
              <React.Fragment key={item.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primaryTypographyProps={{ variant: 'subtitle1' }}
                    secondaryTypographyProps={{ component: 'div' }}
                    primary={new Date(item.createdAt).toLocaleString()}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>{item.prompt}</Typography>
                        {item.imageUrl && (
                          <Box sx={{ mt: 1 }}>
                            <Box component="img" src={item.imageUrl} alt="podgląd" sx={{ width: '100%', height: 140, borderRadius: 2, objectFit: 'cover', border: 1, borderColor: 'divider' }} />
                          </Box>
                        )}
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Box>

        <Box component="main" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <Stack spacing={2} alignItems="center">
            <Fab
              aria-label="Nagraj prompt głosowy"
              color="error"
              size="large"
              sx={{
                width: 168,
                height: 168,
                animation: canRecord ? `${pulse} 1.8s ease-in-out infinite` : 'none',
              }}
              disabled={!canRecord}
              onClick={canRecord ? startRecording : undefined}
            >
              <MicIcon sx={{ fontSize: 56 }} />
            </Fab>

            {status === 'recording' && (
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" onClick={stopRecording}>Stop</Button>
                <Button variant="contained" color="warning" onClick={cancelRecording}>Kosz</Button>
              </Stack>
            )}
          </Stack>
        </Box>
      </Box>

      <Dialog open={status !== 'idle' && status !== 'recording'} fullWidth maxWidth="sm">
        <DialogTitle>Przetwarzanie…</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ my: 2 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {/* Subtle progress bar while steps are running */}
          {(status === 'transcribing' || status === 'generating' || status === 'printing') && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ height: 4, bgcolor: 'action.selected', borderRadius: 999, overflow: 'hidden' }}>
                <Box sx={{ width: '40%', height: '100%', bgcolor: 'primary.main', borderRadius: 999, animation: 'indeterminateSlide 1.6s ease-in-out infinite' }} />
              </Box>
              <style>{`
                @keyframes indeterminateSlide {
                  0% { transform: translateX(-100%); }
                  50% { transform: translateX(120%); }
                  100% { transform: translateX(250%); }
                }
              `}</style>
            </Box>
          )}

          {status === 'done' && (
            <>
              <Alert severity="success" sx={{ mt: 2 }}>Gotowe!</Alert>
              {imageUrl && (
                <Box sx={{ mt: 2 }}>
                  <Box component="img" src={imageUrl} alt="wynik" sx={{ width: '100%', height: 220, borderRadius: 2, objectFit: 'cover', border: 1, borderColor: 'divider' }} />
                </Box>
              )}
            </>
          )}
          {status === 'error' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Wystąpił błąd. Spróbuj ponownie.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatus('idle')} autoFocus>Zamknij</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
