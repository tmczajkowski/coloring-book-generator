import React from 'react';
import { Box } from '@mui/material';
import { HistoryItem } from '../api/client';
import { HistoryList } from './HistoryList';

type HistorySidebarProps = {
  items: HistoryItem[];
  selectedId?: string | null;
  onSelect: (item: HistoryItem) => void;
  onShowPrompt: (item: HistoryItem) => void;
  onDelete: (item: HistoryItem) => void;
};

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  items,
  selectedId,
  onSelect,
  onShowPrompt,
  onDelete,
}) => (
  <Box component="aside" sx={{ width: 480, borderRight: 1, borderColor: 'divider', p: 2, overflow: 'auto' }}>
    <HistoryList
      items={items}
      selectedId={selectedId}
      onSelect={onSelect}
      onShowPrompt={onShowPrompt}
      onDelete={onDelete}
    />
  </Box>
);
