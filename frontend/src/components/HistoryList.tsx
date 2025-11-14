import React from 'react';
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { HistoryItem } from '../api/client';

type HistoryListProps = {
  items: HistoryItem[];
  selectedId?: string | null;
  onSelect: (item: HistoryItem) => void;
  onShowPrompt: (item: HistoryItem) => void;
  onDelete?: (item: HistoryItem) => void;
  dense?: boolean;
};

export const HistoryList: React.FC<HistoryListProps> = ({
  items,
  selectedId,
  onSelect,
  onShowPrompt,
  onDelete,
  dense = true,
}) => (
  <List dense={dense}>
    {items.map((item) => (
      <React.Fragment key={item.id}>
        <ListItem
          disableGutters
          alignItems="flex-start"
          onClick={() => item.imageUrl && onSelect(item)}
          sx={{
            cursor: item.imageUrl ? 'pointer' : 'default',
            bgcolor: selectedId === item.id ? 'action.selected' : undefined,
            px: 1,
          }}
        >
          <ListItemText
            primaryTypographyProps={{ variant: 'subtitle1' }}
            secondaryTypographyProps={{ component: 'div' }}
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1, gap: 1 }}>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {(item.prompt || item.improvedPrompt) && (
                    <Tooltip title="Prompt" arrow>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowPrompt(item);
                        }}
                        sx={{ p: 0.25, bgcolor: 'common.white', color: 'info.main', '&:hover': { bgcolor: 'grey.100' } }}
                        aria-label="Prompt"
                      >
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip title="Usuń kolorowankę">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item);
                        }}
                        sx={{ p: 0.25, bgcolor: 'common.white', color: 'error.main', '&:hover': { bgcolor: 'grey.100' } }}
                        aria-label="Usuń"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            }
            secondary={
              <>
                {item.imageUrl && (
                  <Box
                    sx={{
                      mt: 1,
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      overflow: 'hidden',
                      transition: 'transform .2s ease, box-shadow .2s ease',
                      '&:hover': {
                        transform: 'scale(1.02) rotate(-0.2deg)',
                        boxShadow: '0 10px 24px rgba(0,0,0,0.10)',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={item.imageUrl}
                      alt="podgląd"
                      loading="lazy"
                      decoding="async"
                      sx={{ width: '100%', height: 'auto', display: 'block' }}
                    />
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
);
