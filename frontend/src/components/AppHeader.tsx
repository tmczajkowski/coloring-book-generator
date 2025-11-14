import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Tooltip,
  IconButton,
  Switch,
  Box,
  ButtonBase,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import BrushIcon from '@mui/icons-material/Brush';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { keyframes } from '@mui/system';

type AppHeaderProps = {
  isMobile: boolean;
  sfxEnabled: boolean;
  onToggleSfx: (value: boolean) => void;
  onOpenHistory: () => void;
  onOpenConfig: () => void;
  onGoHome: () => void;
};

const wiggle = keyframes`
  0% { transform: rotate(0deg) translateY(0); }
  30% { transform: rotate(-8deg) translateY(1px); }
  60% { transform: rotate(6deg) translateY(-1px); }
  100% { transform: rotate(0deg) translateY(0); }
`;

export const AppHeader: React.FC<AppHeaderProps> = ({
  isMobile,
  sfxEnabled,
  onToggleSfx,
  onOpenHistory,
  onOpenConfig,
  onGoHome,
}) => (
  <AppBar position="fixed" color="primary" elevation={1}>
    <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
      {isMobile && (
        <Tooltip title="Historia" arrow>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onOpenHistory}
            aria-label="Historia"
            sx={{ mr: 1 }}
          >
            <HistoryIcon />
          </IconButton>
        </Tooltip>
      )}
      <Typography
        variant="h6"
        component="div"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          lineHeight: { xs: 1.15, sm: 1.2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'center', sm: 'flex-start' },
        }}
      >
        <ButtonBase
          onClick={onGoHome}
          aria-label="Przejdź do strony głównej"
          sx={{
            color: 'common.white',
            fontWeight: 800,
            textShadow: '0 1px 2px rgba(0,0,0,0.25)',
            borderRadius: 1,
            px: 0.5,
            py: 0.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', sm: 'flex-start' },
            gap: { xs: 0.5, sm: 1 },
            fontSize: 'inherit',
            minWidth: 0,
            width: '100%',
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: { xs: '1.25rem', sm: 'inherit' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Kolorowanki
          </Box>
          <BrushIcon
            sx={{
              fontSize: 22,
              animation: `${wiggle} 2.4s ease-in-out infinite`,
              transformOrigin: 'bottom center',
              color: 'inherit',
            }}
          />
        </ButtonBase>
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title={sfxEnabled ? 'Dźwięki włączone' : 'Dźwięki wyłączone'} arrow>
          <Box
            sx={{ ml: { xs: 0.75, sm: 1.5 }, pt: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            {sfxEnabled ? (
              <MusicNoteIcon fontSize="small" sx={{ color: 'common.white', mt: 1, mb: 0 }} />
            ) : (
              <VolumeOffIcon fontSize="small" sx={{ color: 'common.white', mt: 1, mb: 0 }} />
            )}
            <Switch
              checked={sfxEnabled}
              onChange={(e) => onToggleSfx(e.target.checked)}
              color={sfxEnabled ? 'success' : 'default'}
              inputProps={{ 'aria-label': 'Dźwięki' }}
            />
          </Box>
        </Tooltip>
        <Tooltip title="Konfiguracja" arrow>
          <IconButton
            size="small"
            sx={{ ml: { xs: 0.75, sm: 1.5 }, color: 'common.white' }}
            onClick={onOpenConfig}
            aria-label="Konfiguracja"
          >
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Toolbar>
  </AppBar>
);
