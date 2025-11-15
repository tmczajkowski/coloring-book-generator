import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { Status } from '../types/status';
import { stripExtension } from '../utils/strings';

type ProcessingDialogProps = {
  open: boolean;
  status: Status;
  processMode: 'full' | 'printOnly' | null;
  prompt: string;
  improveEnabled: boolean;
  improvedPrompt: string | null;
  foundReferences: string[] | null;
  imageUrl: string | null;
  errorText: string | null;
  autoPrint: boolean;
  includeTranscribeStep: boolean;
  isMobile: boolean;
  onClose: () => void;
};

const getSteps = (
  processMode: 'full' | 'printOnly' | null,
  includeTranscribeStep: boolean,
  improveEnabled: boolean,
  autoPrint: boolean,
) => {
  if (processMode === 'printOnly') return ['Drukowanie'];
  const arr: string[] = [];
  if (includeTranscribeStep) arr.push('Transkrypcja');
  if (improveEnabled) arr.push('Ulepszanie promptu');
  arr.push('Wyszukiwanie referencji');
  arr.push('Generowanie obrazu');
  if (autoPrint) arr.push('Drukowanie');
  return arr;
};

const getActiveStep = (
  status: Status,
  steps: string[],
  processMode: 'full' | 'printOnly' | null,
  includeTranscribeStep: boolean,
  improveEnabled: boolean,
  autoPrint: boolean,
) => {
  if (processMode === 'printOnly') return status === 'printing' ? 0 : steps.length;
  let index = 0;
  const idx = {
    transcribing: includeTranscribeStep ? index++ : -1,
    improving: improveEnabled ? (includeTranscribeStep ? index++ : index++) : -1,
    referencing: index++,
    generating: index++,
    printing: autoPrint ? index++ : -1,
  } as const;
  if (status === 'transcribing' && idx.transcribing >= 0) return idx.transcribing;
  if (status === 'improving' && idx.improving >= 0) return idx.improving;
  if (status === 'referencing') return idx.referencing;
  if (status === 'generating') return idx.generating;
  if (status === 'printing' && idx.printing >= 0) return idx.printing;
  return steps.length;
};

export const ProcessingDialog: React.FC<ProcessingDialogProps> = ({
  open,
  status,
  processMode,
  prompt,
  improveEnabled,
  improvedPrompt,
  foundReferences,
  imageUrl,
  errorText,
  autoPrint,
  includeTranscribeStep,
  isMobile,
  onClose,
}) => {
  const steps = React.useMemo(
    () => getSteps(processMode, includeTranscribeStep, improveEnabled, autoPrint),
    [processMode, includeTranscribeStep, improveEnabled, autoPrint],
  );

  const activeStep = React.useMemo(
    () => getActiveStep(status, steps, processMode, includeTranscribeStep, improveEnabled, autoPrint),
    [status, steps, processMode, includeTranscribeStep, improveEnabled, autoPrint],
  );

  const showProgressBar =
    status === 'transcribing' ||
    status === 'improving' ||
    status === 'referencing' ||
    status === 'generating' ||
    status === 'printing';

  const showPromptDetails = prompt && processMode !== 'printOnly';

  return (
    <Dialog onClose={onClose} open={open} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Przetwarzanie…</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ my: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {showPromptDetails && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="subtitle2" gutterBottom>
              Podstawowy prompt
            </Typography>
            <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {prompt}
            </Box>
            {improveEnabled && improvedPrompt != null && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Ulepszony prompt
                </Typography>
                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  {improvedPrompt}
                </Box>
              </Box>
            )}
            {foundReferences != null && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Wybrane referencje
                </Typography>
                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  {foundReferences.length > 0 ? foundReferences.map(stripExtension).join(', ') : '— (brak)'}
                </Box>
              </Box>
            )}
          </Box>
        )}
        {showProgressBar && (
          <Box sx={{ mt: 3, mb: 2 }}>
            {/* Animated crayons spinner */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 1, height: 64, mb: 2 }}>
              {['#EF476F', '#FB5607', '#FFB703', '#06D6A0', '#118AB2', '#073B4C'].map((color, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 8,
                    height: 48,
                    background: `linear-gradient(to bottom, ${color} 0%, ${color} 70%, #FFF 70%, #FFF 75%, ${color} 75%)`,
                    borderRadius: '2px 2px 0 0',
                    transformOrigin: 'bottom',
                    animation: `crayon-bounce 1.2s ease-in-out ${i * 0.12}s infinite`,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      bottom: -6,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderTop: `6px solid ${color}`,
                    },
                  }}
                />
              ))}
            </Box>
            <Box sx={{ height: 4, bgcolor: 'action.selected', borderRadius: 999, overflow: 'hidden' }}>
              <Box sx={{ width: '40%', height: '100%', background: 'linear-gradient(90deg, #EF476F 0%, #FB5607 25%, #FFB703 50%, #06D6A0 75%, #118AB2 100%)', borderRadius: 999, animation: 'indeterminateSlide 1.6s ease-in-out infinite' }} />
            </Box>
            <style>
              {`
                @keyframes indeterminateSlide {
                  0% { transform: translateX(-100%); }
                  50% { transform: translateX(120%); }
                  100% { transform: translateX(250%); }
                }
                @keyframes crayon-bounce {
                  0%, 100% { transform: scaleY(1) translateY(0); }
                  50% { transform: scaleY(1.15) translateY(-8px); }
                }
              `}
            </style>
          </Box>
        )}
        {status === 'done' && (
          <>
            <Alert
              severity="success"
              icon={<CelebrationIcon />}
              sx={{
                mt: 2,
                animation: 'slide-in-top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '@keyframes slide-in-top': {
                  '0%': { opacity: 0, transform: 'translateY(-20px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              Gotowe!
            </Alert>
            {imageUrl && (
              <Box
                sx={{
                  mt: 2,
                  animation: 'zoom-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both',
                  '@keyframes zoom-in': {
                    '0%': { opacity: 0, transform: 'scale(0.8)' },
                    '100%': { opacity: 1, transform: 'scale(1)' },
                  },
                }}
              >
                <Box
                  component="img"
                  src={imageUrl}
                  alt="wynik"
                  sx={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    maxHeight: { xs: '60vh', sm: '70vh' },
                    objectFit: 'contain',
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
                    outline: '3px dashed rgba(251,133,0,0.25)',
                    outlineOffset: 6,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                    },
                  }}
                />
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
        <Button onClick={onClose} autoFocus startIcon={<CloseIcon />}>
          Zamknij
        </Button>
      </DialogActions>
    </Dialog>
  );
};
