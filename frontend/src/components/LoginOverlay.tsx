import React from 'react';
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

type LoginOverlayProps = {
  password: string;
  error: string | null;
  busy: boolean;
  onPasswordChange: (value: string) => void;
  onSubmit: () => Promise<void> | void;
};

export const LoginOverlay: React.FC<LoginOverlayProps> = ({
  password,
  error,
  busy,
  onPasswordChange,
  onSubmit,
}) => (
  <Box sx={{ display: 'grid', placeItems: 'center', height: '100dvh', p: 2, bgcolor: 'background.default' }}>
    <Box sx={{ width: '100%', maxWidth: 420, bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Wymagane logowanie
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Podaj hasło aby uzyskać dostęp.
      </Typography>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onSubmit();
        }}
      >
        <TextField
          type="password"
          label="Hasło"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          autoFocus
          fullWidth
          disabled={busy}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 1.5 }}>
            {error}
          </Alert>
        )}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" disabled={busy} fullWidth>
            {busy ? 'Logowanie…' : 'Zaloguj'}
          </Button>
        </Stack>
      </form>
    </Box>
  </Box>
);
