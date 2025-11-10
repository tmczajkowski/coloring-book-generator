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
    IconButton,
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
  import CloseIcon from '@mui/icons-material/Close';
  import AutorenewIcon from '@mui/icons-material/Autorenew';
  import DeleteIcon from '@mui/icons-material/Delete';
  import { keyframes } from '@mui/system';

type Status = 'idle' | 'recording' | 'transcribing' | 'generating' | 'printing' | 'done' | 'error';

export const App: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [prompt, setPrompt] = useState('');
  const [id, setId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [previewBustToken, setPreviewBustToken] = useState<number>(0);
  const [errorText, setErrorText] = useState<string | null>(null);
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

  useEffect(() => {
    // Load runtime config (timeouts) then fetch history
    api.loadConfig().finally(() => {
      refreshHistory();
    });
  }, []);

  // Keep URL and localStorage in sync with autoPrint state
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    sp.set('auto-print', String(autoPrint));
    const url = `${window.location.pathname}?${sp.toString()}`;
    window.history.replaceState({}, '', url);
    try { localStorage.setItem('autoPrint', String(autoPrint)); } catch {}
  }, [autoPrint]);

  // Close preview with ESC key
  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  const refreshHistory = async () => {
    try { setHistory(await api.history()); } catch { /* ignore */ }
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
        } catch (e: any) {
          console.error(e);
          setErrorText(e?.message || 'Wystąpił błąd podczas przetwarzania.');
          setStatus('error');
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setStatus('recording');
    } catch (e: any) {
      console.error(e);
      setErrorText('Brak uprawnień do mikrofonu lub problem z nagrywaniem.');
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
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, pt: { xs: 7, sm: 8 } }}>
        <Box component="aside" sx={{ width: 480, borderRight: 1, borderColor: 'divider', p: 2, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>Historia</Typography>
          <List dense>
            {history.map(item => (
              <React.Fragment key={item.id}>
                <ListItem
                  alignItems="flex-start"
                  onClick={() => item.imageUrl && setSelected(item)}
                  sx={{ cursor: item.imageUrl ? 'pointer' : 'default', bgcolor: selected?.id === item.id ? 'action.selected' : undefined }}
                >
                  <ListItemText
                    primaryTypographyProps={{ variant: 'subtitle1' }}
                    secondaryTypographyProps={{ component: 'div' }}
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                        <Tooltip title="Usuń kolorowankę">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await api.remove(item.id);
                                if (selected?.id === item.id) setSelected(null);
                                await refreshHistory();
                              } catch (err) {
                                console.error('Delete failed:', err);
                                setStatus('error');
                              }
                            }}
                            sx={{ p: 0.25, bgcolor: 'error.main', color: 'common.white', '&:hover': { bgcolor: 'error.dark' } }}
                            aria-label="Usuń"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>{item.prompt}</Typography>
                        {item.imageUrl && (
                          <Box sx={{ mt: 1, borderRadius: 2, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
                            <Box component="img" src={item.imageUrl} alt="podgląd" sx={{ width: '100%', height: 'auto', display: 'block' }} />
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

        <Box component="main" sx={{ flex: 1, position: 'relative', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {(selected && status !== 'recording') ? (
            <Box sx={{ display: 'flex', width: '100%', height: '100%', gap: 2 }}>
              {/* Image area on the left (bigger) */}
              {selected.imageUrl && (
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box
                    component="img"
                    src={`${selected.imageUrl}?t=${previewBustToken}`}
                    alt={selected.prompt}
                    sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 2, border: 1, borderColor: 'divider' }}
                  />
                </Box>
              )}

              {/* Actions column on the right (vertical) */}
              <Box sx={{ width: 64, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                <Tooltip title="Zamknij podgląd">
                  <IconButton
                    onClick={() => setSelected(null)}
                    sx={{ bgcolor: 'common.black', color: 'common.white', boxShadow: 1, '&:hover': { bgcolor: 'grey.800' } }}
                    aria-label="Zamknij"
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
                {selected.imageUrl && (
                  <Tooltip title="Wygeneruj ponownie">
                    <IconButton
                      onClick={async () => {
                        try {
                          setStatus('generating');
                          setPrompt(selected.prompt);
                          const newId = String(Date.now());
                          const gen = await api.generate(newId, selected.prompt);
                          setImageUrl(gen.imageUrl);
                          await refreshHistory();
                          // Re-select updated item and bust cache for preview
                          const updated = (await api.history()).find(i => i.id === newId);
                          if (updated) setSelected(updated);
                          setPreviewBustToken(Date.now());
                          setStatus('done');
                        } catch (e) {
                          console.error('Regenerate failed:', e);
                          setStatus('error');
                        }
                      }}
                      sx={{ bgcolor: 'info.main', color: 'common.white', boxShadow: 1, '&:hover': { bgcolor: 'info.dark' } }}
                      aria-label="Wygeneruj ponownie"
                      disabled={!(status === 'idle' || status === 'done' || status === 'error')}
                    >
                      <AutorenewIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {selected.imageUrl && (
                  <Tooltip title="Drukuj kolorowankę">
                    <IconButton
                      onClick={async () => {
                        try {
                          setId(selected.id);
                          setStatus('printing');
                          await api.print(selected.id);
                          setStatus('done');
                          await refreshHistory();
                        } catch (e) {
                          console.error('Print failed:', e);
                          setStatus('error');
                        }
                      }}
                      sx={{ bgcolor: 'success.main', color: 'common.white', boxShadow: 1, '&:hover': { bgcolor: 'success.dark' } }}
                      aria-label="Drukuj"
                      disabled={!(status === 'idle' || status === 'done' || status === 'error')}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {selected && (
                  <Tooltip title="Usuń kolorowankę">
                    <IconButton
                      onClick={async () => {
                        try {
                          await api.remove(selected.id);
                          setSelected(null);
                          await refreshHistory();
                          setStatus('idle');
                        } catch (e) {
                          console.error('Delete failed:', e);
                          setStatus('error');
                        }
                      }}
                      sx={{ bgcolor: 'error.main', color: 'common.white', boxShadow: 1, '&:hover': { bgcolor: 'error.dark' } }}
                      aria-label="Usuń"
                      disabled={!(status === 'idle' || status === 'done' || status === 'error')}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          ) : (
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
          )}
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
          {prompt && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="subtitle2" gutterBottom>Prompt</Typography>
              <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {prompt}
              </Box>
            </Box>
          )}
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
              {errorText || 'Wystąpił błąd. Spróbuj ponownie.'}
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
