import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { HistoryItem } from '../api/client';
import { stripExtension } from '../utils/strings';

type PromptDetailsDialogProps = {
  item: HistoryItem | null;
  open: boolean;
  onClose: () => void;
};

export const PromptDetailsDialog: React.FC<PromptDetailsDialogProps> = ({ item, open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>Prompt</DialogTitle>
    <DialogContent dividers>
      {item && (
        <Stack spacing={2}>
          {item.prompt && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Podstawowy prompt
              </Typography>
              <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {item.prompt}
              </Box>
            </Box>
          )}
          {item.improvedPrompt && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Ulepszony prompt
              </Typography>
              <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {item.improvedPrompt}
              </Box>
            </Box>
          )}
          {item.references && item.references.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Referencje
              </Typography>
              <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {item.references.map(stripExtension).join(', ')}
              </Box>
            </Box>
          )}
        </Stack>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} startIcon={<CloseIcon />}>
        Zamknij
      </Button>
    </DialogActions>
  </Dialog>
);
