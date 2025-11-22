import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Link,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SelectChangeEvent } from '@mui/material/Select';
import { RuntimeConfig } from '../api/client';

type ConfigDialogProps = {
  open: boolean;
  runtimeConfig: RuntimeConfig | null;
  selectedImageModel: string | null;
  onSelectImageModel: (model: string) => void;
  onClose: () => void;
};

export const ConfigDialog: React.FC<ConfigDialogProps> = ({
  open,
  runtimeConfig,
  onClose,
  selectedImageModel,
  onSelectImageModel,
}) => {
  const imageModelOptions = runtimeConfig?.imageModelOptions ?? [];
  const selectValue = selectedImageModel || runtimeConfig?.imageModel || '';
  const handleImageModelChange = (event: SelectChangeEvent<string>) => {
    const newValue = event.target.value;
    if (newValue) {
      onSelectImageModel(newValue);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Konfiguracja</DialogTitle>
      <DialogContent dividers>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Więcej szczegółów i kod źródłowy
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Zobacz projekt na{' '}
            <Link href="https://github.com/Patresss/coloring-book-generator" target="_blank" rel="noopener noreferrer">
              GitHub
            </Link>
            {' '}— instrukcje, zmiany i źródła.
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="subtitle2">GEMINI_IMAGE_MODELS</Typography>
            {imageModelOptions.length > 0 ? (
              <>
                <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                  <Select value={selectValue} onChange={handleImageModelChange} displayEmpty>
                    {imageModelOptions.map((model) => (
                      <MenuItem key={model} value={model}>
                        {model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Zmiana dotyczy tylko tej przeglądarki.
                </Typography>
              </>
            ) : (
              <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace' }}>
                {runtimeConfig?.imageModel || '—'}
              </Box>
            )}
          </Box>
          <Box>
            <Typography variant="subtitle2">GEMINI_IMAGE_ASPECT_RATIO</Typography>
            <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace' }}>
              {runtimeConfig?.geminiAspectRatio || '—'}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2">GEMINI_TIMEOUT_MS</Typography>
            <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace' }}>
              {runtimeConfig?.geminiTimeoutMs ?? '—'}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2">OPENAI_IMAGE_REFERENCES_MODEL</Typography>
            <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace' }}>
              {runtimeConfig?.imageReferencesModel || '—'}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2">OPENAI_TEXT_MODEL</Typography>
            <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace' }}>
              {runtimeConfig?.textModel || '—'}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2">OPENAI_STT_MODEL</Typography>
            <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace' }}>
              {runtimeConfig?.sttModel || '—'}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2">OPENAI_TIMEOUT_MS</Typography>
            <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace' }}>
              {runtimeConfig?.openaiTimeoutMs ?? '—'}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2">PRINTER_URI</Typography>
            <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {runtimeConfig?.printerUri || '—'}
            </Box>
          </Box>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Większość wartości zmienisz w zmiennych środowiskowych i po restarcie aplikacji.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Zamknij
        </Button>
      </DialogActions>
    </Dialog>
  );
};

