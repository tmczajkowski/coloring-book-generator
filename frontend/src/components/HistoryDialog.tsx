import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { HistoryItem } from '../api/client';
import { HistoryList } from './HistoryList';

type HistoryDialogProps = {
  open: boolean;
  items: HistoryItem[];
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
  onShowPrompt: (item: HistoryItem) => void;
  onDelete: (item: HistoryItem) => void;
};

export const HistoryDialog: React.FC<HistoryDialogProps> = ({
  open,
  items,
  onClose,
  onSelect,
  onShowPrompt,
  onDelete,
}) => (
  <Dialog
    open={open}
    fullScreen
    onClose={onClose}
    PaperProps={{ sx: { bgcolor: 'background.default' } }}
  >
    <DialogContent dividers sx={{ bgcolor: 'background.default', p: 0 }}>
      <HistoryList
        items={items}
        onSelect={(item) => {
          if (item.imageUrl) {
            onSelect(item);
            onClose();
          }
        }}
        onShowPrompt={onShowPrompt}
        onDelete={onDelete}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} startIcon={<CloseIcon />}>
        Zamknij
      </Button>
    </DialogActions>
  </Dialog>
);
