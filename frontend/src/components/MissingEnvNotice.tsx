import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { RuntimeConfig } from '../api/client';

type MissingEnvNoticeProps = {
  runtimeConfig: RuntimeConfig;
  canGenerate: boolean;
};

export const MissingEnvNotice: React.FC<MissingEnvNoticeProps> = ({ runtimeConfig, canGenerate }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', p: 2 }}>
    <Box sx={{ width: '100%', maxWidth: 900 }}>
      <Alert severity={canGenerate ? 'warning' : 'error'} sx={{ p: 3, '& .MuiAlert-message': { width: '100%' } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Brakuje konfiguracji środowiska
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5 }}>
          Brakujące zmienne:
        </Typography>
        <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', wordBreak: 'break-word' }}>
          {runtimeConfig.missingEnv?.join(', ')}
        </Box>
        {!canGenerate && (
          <Typography variant="body1" sx={{ mt: 1.5, fontWeight: 600 }}>
            Generowanie kolorowanek jest zablokowane do czasu uzupełnienia konfiguracji.
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Uzupełnij zmienne środowiskowe i zrestartuj backend.
        </Typography>
      </Alert>
    </Box>
  </Box>
);
