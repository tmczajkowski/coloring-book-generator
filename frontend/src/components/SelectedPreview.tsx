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
  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%', gap: 2 }}>
      {item.imageUrl && (
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pb: { xs: 8, sm: 0 } }}>
          <Box
            component="img"
            src={`${item.imageUrl}?t=${previewBustToken}`}
            alt={item.prompt}
            loading="eager"
            decoding="async"
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
            }}
          />
        </Box>
      )}
      {!isMobile ? (
        <Box sx={{ width: 64, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Zamknij podgląd">
            <IconButton
              onClick={onClose}
              sx={{ bgcolor: 'common.black', color: 'common.white', boxShadow: 1, '&:hover': { bgcolor: 'grey.800' } }}
              aria-label="Zamknij"
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
          {item.imageUrl && (
            <Tooltip title="Wygeneruj ponownie">
              <IconButton
                onClick={onRegenerate}
                sx={{ bgcolor: 'info.main', color: 'common.white', boxShadow: 1, '&:hover': { bgcolor: 'info.dark' } }}
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
                sx={{ bgcolor: 'success.main', color: 'common.white', boxShadow: 1, '&:hover': { bgcolor: 'success.dark' } }}
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
              sx={{ bgcolor: 'error.main', color: 'common.white', boxShadow: 1, '&:hover': { bgcolor: 'error.dark' } }}
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
            <IconButton onClick={onClose} sx={{ bgcolor: 'common.black', color: 'common.white', boxShadow: 2 }} aria-label="Zamknij">
              <CloseIcon />
            </IconButton>
          </Tooltip>
          {item.imageUrl && (
            <Tooltip title="Wygeneruj ponownie">
              <IconButton
                onClick={onRegenerate}
                sx={{ bgcolor: 'info.main', color: 'common.white', boxShadow: 2 }}
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
                sx={{ bgcolor: 'success.main', color: 'common.white', boxShadow: 2 }}
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
              sx={{ bgcolor: 'error.main', color: 'common.white', boxShadow: 2 }}
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
