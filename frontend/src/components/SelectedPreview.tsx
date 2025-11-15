import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';
import { HistoryItem } from '../api/client';
import { Status } from '../types/status';

type SelectedPreviewProps = {
  item: HistoryItem;
  isMobile: boolean;
  previewBustToken: number;
  status: Status;
  onClose: () => void;
  onRegenerate: () => void;
  onPrint: () => void;
  onDelete: () => void;
};

export const SelectedPreview: React.FC<SelectedPreviewProps> = ({
  item,
  isMobile,
  previewBustToken,
  status,
  onClose,
  onRegenerate,
  onPrint,
  onDelete,
}) => {
  const actionsDisabled = !(status === 'idle' || status === 'done' || status === 'error');
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [showReveal, setShowReveal] = React.useState(true);

  React.useEffect(() => {
    setImageLoaded(false);
    setShowReveal(true);
    const timer = setTimeout(() => setShowReveal(false), 1500);
    return () => clearTimeout(timer);
  }, [item.id, previewBustToken]);

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%', gap: 2 }}>
      {item.imageUrl && (
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pb: { xs: 8, sm: 0 } }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Box
              component="img"
              src={`${item.imageUrl}?t=${previewBustToken}`}
              alt={item.prompt}
              loading="eager"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
                position: 'relative',
                outline: '3px dashed rgba(251,133,0,0.25)',
                outlineOffset: 6,
                opacity: imageLoaded ? 1 : 0,
                transform: imageLoaded ? 'scale(1)' : 'scale(0.95)',
                transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
            {showReveal && imageLoaded && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.95) 50%, transparent 100%)',
                  animation: 'reveal-sweep 1.5s ease-out forwards',
                  pointerEvents: 'none',
                  borderRadius: 2,
                }}
              />
            )}
            <style>
              {`
                @keyframes reveal-sweep {
                  0% { transform: translateY(-100%); opacity: 1; }
                  100% { transform: translateY(100%); opacity: 0; }
                }
              `}
            </style>
          </Box>
        </Box>
      )}
      {!isMobile ? (
        <Box sx={{ width: 64, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Zamknij podgląd">
            <IconButton
              onClick={onClose}
              sx={{
                bgcolor: 'common.black',
                color: 'common.white',
                boxShadow: 1,
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': {
                  bgcolor: 'grey.800',
                  transform: 'scale(1.1) rotate(-5deg)',
                  boxShadow: 3,
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
              aria-label="Zamknij"
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
          {item.imageUrl && (
            <Tooltip title="Wygeneruj ponownie">
              <IconButton
                onClick={onRegenerate}
                sx={{
                  bgcolor: 'info.main',
                  color: 'common.white',
                  boxShadow: 1,
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '&:hover': {
                    bgcolor: 'info.dark',
                    transform: 'scale(1.1) rotate(180deg)',
                    boxShadow: 3,
                  },
                  '&:active': {
                    transform: 'scale(0.95) rotate(180deg)',
                  },
                }}
                aria-label="Wygeneruj ponownie"
                disabled={actionsDisabled}
              >
                <AutorenewIcon />
              </IconButton>
            </Tooltip>
          )}
          {item.id && (
            <Tooltip title="Drukuj">
              <IconButton
                onClick={onPrint}
                sx={{
                  bgcolor: 'success.main',
                  color: 'common.white',
                  boxShadow: 1,
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '&:hover': {
                    bgcolor: 'success.dark',
                    transform: 'scale(1.1)',
                    boxShadow: 3,
                    animation: 'bounce 0.5s ease',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  '@keyframes bounce': {
                    '0%, 100%': { transform: 'scale(1.1) translateY(0)' },
                    '50%': { transform: 'scale(1.1) translateY(-4px)' },
                  },
                }}
                aria-label="Drukuj"
                disabled={actionsDisabled}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Usuń kolorowankę">
            <IconButton
              onClick={onDelete}
              sx={{
                bgcolor: 'error.main',
                color: 'common.white',
                boxShadow: 1,
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': {
                  bgcolor: 'error.dark',
                  transform: 'scale(1.1)',
                  boxShadow: 3,
                  animation: 'shake 0.4s ease',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
                '@keyframes shake': {
                  '0%, 100%': { transform: 'scale(1.1) rotate(0deg)' },
                  '25%': { transform: 'scale(1.1) rotate(-5deg)' },
                  '75%': { transform: 'scale(1.1) rotate(5deg)' },
                },
              }}
              aria-label="Usuń"
              disabled={actionsDisabled}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 12, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Tooltip title="Zamknij podgląd">
            <IconButton
              onClick={onClose}
              sx={{
                bgcolor: 'common.black',
                color: 'common.white',
                boxShadow: 2,
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:active': { transform: 'scale(0.9)', boxShadow: 1 },
              }}
              aria-label="Zamknij"
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
          {item.imageUrl && (
            <Tooltip title="Wygeneruj ponownie">
              <IconButton
                onClick={onRegenerate}
                sx={{
                  bgcolor: 'info.main',
                  color: 'common.white',
                  boxShadow: 2,
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '&:active': { transform: 'scale(0.9) rotate(180deg)', boxShadow: 1 },
                }}
                aria-label="Wygeneruj ponownie"
                disabled={actionsDisabled}
              >
                <AutorenewIcon />
              </IconButton>
            </Tooltip>
          )}
          {item.id && (
            <Tooltip title="Drukuj">
              <IconButton
                onClick={onPrint}
                sx={{
                  bgcolor: 'success.main',
                  color: 'common.white',
                  boxShadow: 2,
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '&:active': { transform: 'scale(0.9)', boxShadow: 1 },
                }}
                aria-label="Drukuj"
                disabled={actionsDisabled}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Usuń kolorowankę">
            <IconButton
              onClick={onDelete}
              sx={{
                bgcolor: 'error.main',
                color: 'common.white',
                boxShadow: 2,
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:active': { transform: 'scale(0.9)', boxShadow: 1 },
              }}
              aria-label="Usuń"
              disabled={actionsDisabled}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};
