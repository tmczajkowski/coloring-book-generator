import React from 'react';
import {
  Box,
  Stack,
  Tooltip,
  Switch,
  Fab,
  Button,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import CropLandscapeIcon from '@mui/icons-material/CropLandscape';
import CropPortraitIcon from '@mui/icons-material/CropPortrait';
import MicIcon from '@mui/icons-material/Mic';
import PrintIcon from '@mui/icons-material/Print';
import BrushIcon from '@mui/icons-material/Brush';
import { keyframes } from '@mui/system';
import { Status } from '../types/status';

type RecordingControlsProps = {
  status: Status;
  isMobile: boolean;
  canRecord: boolean;
  autoPrint: boolean;
  improveEnabled: boolean;
  landscapeMode: boolean;
  ideasVisible: boolean;
  onAutoPrintChange: (value: boolean) => void;
  onImproveChange: (value: boolean) => void;
  onLandscapeChange: (value: boolean) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  onIdeaSelect: (prompt: string) => void;
};

const ideaCatalog = [
  { icon: '🌈', label: 'Tęcze', prompt: 'Tęcze z 7 paskami na kazdy kolor' },
  { icon: '🦄', label: 'Jednorożce', prompt: 'Jednorożce w magicznym lesie' },
  { icon: '🦁', label: 'Zwierzęta w zoo', prompt: 'Lew, żyrafa i słoń w zoo' },
  { icon: '🐶', label: 'Pieski', prompt: 'Pieski bawiące się piłką' },
  { icon: '🐱', label: 'Kotki', prompt: 'Kotki śpiące na poduszkach' },
  { icon: '👗', label: 'Lalki', prompt: 'Lalki w stylu Barbie w modnych strojach i z długimi włosami' },
  { icon: '🚗', label: 'Samochody', prompt: 'Samochody wyścigowe na torze' },
  { icon: '🚀', label: 'Rakiety', prompt: 'Rakiety lecące w kosmos, planety i gwiazdy' },
  { icon: '🦸‍♀️', label: 'Superbohaterowie', prompt: 'Superbohaterowie w akcji w dynamicznych pozach' },
  { icon: '🧚‍♀️', label: 'Wróżki', prompt: 'Bajkowe wróżki z różdżkami' },
  { icon: '🐯', label: 'Tygryski', prompt: 'Przyjazne tygryski w dżungli' },
  { icon: '🦓', label: 'Zebry', prompt: 'Zebra na sawannie' },
  { icon: '🦒', label: 'Żyrafy', prompt: 'Żyrafa pod drzewem akacji' },
  { icon: '🐘', label: 'Słonie', prompt: 'Słoń z trąbą unoszącą wodę' },
  { icon: '🐵', label: 'Małpki', prompt: 'Wesołe małpki na lianach' },
  { icon: '🐸', label: 'Żabki', prompt: 'Żabka na liściu nenufaru' },
  { icon: '🐢', label: 'Żółwie', prompt: 'Żółw na plaży' },
  { icon: '🐳', label: 'Ocean', prompt: 'Podwodny świat z wielorybem i rybkami' },
  { icon: '🦕', label: 'Dinozaury', prompt: 'Przyjazne dinozaury w parku' },
  { icon: '🏰', label: 'Zamki', prompt: 'Bajkowy zamek na wzgórzu' },
  { icon: '👸', label: 'Księżniczki', prompt: 'Księżniczka w sukni balowej' },
  { icon: '🤴', label: 'Książęta', prompt: 'Książę z mieczem, uśmiechnięty' },
  { icon: '🪖', label: 'Żołnierzyki', prompt: 'Zabawkowe żołnierzyki na paradzie z flagami' },
  { icon: '🐉', label: 'Smoki', prompt: 'Przyjazny smok nad wioską' },
  { icon: '🧜‍♀️', label: 'Syrenki', prompt: 'Syrenka w morzu, muszelki i rybki' },
  { icon: '🦋', label: 'Motyle', prompt: 'Motyle nad łąką' },
  { icon: '🌸', label: 'Kwiaty', prompt: 'Różne kwiaty w ogrodzie' },
  { icon: '🌵', label: 'Pustynia', prompt: 'Kaktusy i zachód słońca' },
  { icon: '🌲', label: 'Las', prompt: 'Leśne zwierzątka i drzewa' },
  { icon: '🏖️', label: 'Plaża', prompt: 'Plaża z zamkiem z piasku, wiaderkiem i łopatką' },
  { icon: '🏜️', label: 'Kaniony', prompt: 'Skaliste kaniony i słońce' },
  { icon: '🏞️', label: 'Góry', prompt: 'Góry, rzeka i sosny' },
  { icon: '🚌', label: 'Autobus', prompt: 'Wesoły szkolny autobus' },
  { icon: '🚒', label: 'Straż', prompt: 'Wóz strażacki w akcji (bez ognia)' },
  { icon: '🚑', label: 'Karetka', prompt: 'Karetka z uśmiechniętym kierowcą' },
  { icon: '✈️', label: 'Samoloty', prompt: 'Samolot nad chmurami' },
  { icon: '🚂', label: 'Pociągi', prompt: 'Lokomotywa na torach' },
  { icon: '🚲', label: 'Rowerki', prompt: 'Dziecięcy rowerek w parku' },
  { icon: '🛵', label: 'Skutery', prompt: 'Skuter w mieście' },
  { icon: '🧩', label: 'Kształty', prompt: 'Duże proste kształty geometryczne' },
  { icon: '🎈', label: 'Balony', prompt: 'Mnóstwo balonów nad miasteczkiem' },
  { icon: '🎠', label: 'Karuzela', prompt: 'Karuzela z konikami' },
  { icon: '🎪', label: 'Cyrk', prompt: 'Cyrkowy namiot i przyjazny klaun' },
  { icon: '🎃', label: 'Dynia', prompt: 'Uśmiechnięte dynie i jesienne liście' },
  { icon: '❄️', label: 'Zima', prompt: 'Bałwan i śnieżynki' },
  { icon: '🌞', label: 'Lato', prompt: 'Słońce, plaża i lody' },
  { icon: '🌧️', label: 'Deszcz', prompt: 'Parasolka i kałuże' },
  { icon: '🪐', label: 'Planety', prompt: 'Układ słoneczny: planety i gwiazdy' },
  { icon: '🧁', label: 'Słodkości', prompt: 'Babeczki i cukierki' },
  { icon: '🍕', label: 'Pizza', prompt: 'Wesoła pizza z uśmiechem' },
  { icon: '🍦', label: 'Lody', prompt: 'Pucharek lodów z posypką' },
  { icon: '🏀', label: 'Sport', prompt: 'Piłki sportowe: koszykówka i piłka nożna' },
  { icon: '🎸', label: 'Muzyka', prompt: 'Instrumenty muzyczne' },
  { icon: '🧱', label: 'Klocki', prompt: 'Wieża z klocków' },
] as const;

const ORBIT_SPEED = 0.2;

const buildIdeaSet = () => {
  const shuffled = [...ideaCatalog].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10);
};

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,71,111, 0.4); }
  70% { transform: scale(1.04); box-shadow: 0 0 0 18px rgba(239,71,111, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,71,111, 0); }
`;

const recordPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239,71,111, 0.55); transform: scale(1); }
  60% { box-shadow: 0 0 0 12px rgba(239,71,111, 0); transform: scale(1.03); }
  100% { box-shadow: 0 0 0 0 rgba(239,71,111, 0); transform: scale(1); }
`;

const recordPulseSuccess = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(16,185,129, 0.55); transform: scale(1); }
  60% { box-shadow: 0 0 0 12px rgba(16,185,129, 0); transform: scale(1.03); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129, 0); transform: scale(1); }
`;

const wave = keyframes`
  0% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
  100% { transform: scaleY(0.4); }
`;

const wiggle = keyframes`
  0% { transform: rotate(0deg) translateY(0); }
  30% { transform: rotate(-8deg) translateY(1px); }
  60% { transform: rotate(6deg) translateY(-1px); }
  100% { transform: rotate(0deg) translateY(0); }
`;

type RingGeometry = { radius: number; item: number; emoji: number };

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  status,
  isMobile,
  canRecord,
  autoPrint,
  improveEnabled,
  landscapeMode,
  ideasVisible,
  onAutoPrintChange,
  onImproveChange,
  onLandscapeChange,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onIdeaSelect,
}) => {
  const [ring, setRing] = React.useState<RingGeometry>(() => ({
    radius: isMobile ? 150 : 200,
    item: isMobile ? 72 : 88,
    emoji: isMobile ? 30 : 34,
  }));

  React.useEffect(() => {
    const recalc = () => {
      if (typeof window === 'undefined') return;
      const minDim = Math.min(window.innerWidth, window.innerHeight);
      const baseR = isMobile ? 150 : 200;
      const item = minDim < 360 ? (isMobile ? 56 : 72) : (isMobile ? 72 : 88);
      const padding = 16;
      const maxR = Math.floor(minDim / 2) - Math.floor(item / 2) - padding;
      const radius = Math.max(80, Math.min(baseR, maxR));
      const emoji = item <= 56 ? (isMobile ? 22 : 26) : (isMobile ? 30 : 34);
      setRing({ radius, item, emoji });
    };
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, [isMobile]);

  const ringClearance = Math.max(140, ring.radius + ring.item);
  const ringPadding = isMobile ? 0 : 80;
  const ringBoxSize = ring.radius * 2 + ring.item + ringPadding;
  const ringBoxSizePx = `${ringBoxSize}px`;
  const [ideas, setIdeas] = React.useState(buildIdeaSet);
  const refreshIdeas = React.useCallback(() => setIdeas(buildIdeaSet()), []);
  const [orbitAngle, setOrbitAngle] = React.useState(0);
  const orbitFrameRef = React.useRef<number | null>(null);
  const orbitLastTimestampRef = React.useRef<number | null>(null);
  const [orbitPaused, setOrbitPaused] = React.useState(false);

  React.useEffect(() => {
    const cleanup = () => {
      if (orbitFrameRef.current != null) {
        cancelAnimationFrame(orbitFrameRef.current);
        orbitFrameRef.current = null;
      }
      orbitLastTimestampRef.current = null;
    };

    if (orbitPaused) {
      cleanup();
      return cleanup;
    }

    const step = (time: number) => {
      if (orbitLastTimestampRef.current != null) {
        const delta = time - orbitLastTimestampRef.current;
        setOrbitAngle((prev) => (prev + (delta / 1000) * ORBIT_SPEED) % (Math.PI * 2));
      }
      orbitLastTimestampRef.current = time;
      orbitFrameRef.current = requestAnimationFrame(step);
    };

    orbitFrameRef.current = requestAnimationFrame(step);
    return cleanup;
  }, [orbitPaused]);

  const handleIdeaMouseEnter = () => setOrbitPaused(true);
  const handleIdeaMouseLeave = () => setOrbitPaused(false);
  const fabDisabled = status !== 'recording' && !canRecord;

  return (
    <Stack spacing={2} alignItems="center" sx={{ width: '100%', maxWidth: { xs: 420, sm: 640 }, mx: 'auto' }}>
      {status !== 'recording' && (
        <Stack spacing={0} sx={{ width: '100%', maxWidth: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.5 },
              bgcolor: (theme) => theme.palette.background.paper,
              opacity: 0.8,
              borderRadius: 3,
              px: { xs: 1, sm: 1.5 },
              py: { xs: 0.75, sm: 1 },
              boxShadow: 4,
              width: 'fit-content',
              maxWidth: '100%',
              mx: 'auto',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <Tooltip title={landscapeMode ? 'Orientacja pozioma' : 'Orientacja pionowa'} arrow>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {landscapeMode ? <CropLandscapeIcon color="primary" /> : <CropPortraitIcon color="action" />}
                <Switch
                  size="small"
                  checked={landscapeMode}
                  onChange={(e) => onLandscapeChange(e.target.checked)}
                  color="primary"
                  inputProps={{ 'aria-label': 'Orientacja pozioma' }}
                />
              </Box>
            </Tooltip>
            <Tooltip title={autoPrint ? 'Automatyczne drukowanie włączone' : 'Kolorowanki nie będą drukowane automatycznie'} arrow>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PrintIcon color={autoPrint ? 'primary' : 'action'} />
                <Switch
                  size="small"
                  checked={autoPrint}
                  onChange={(e) => onAutoPrintChange(e.target.checked)}
                  color="primary"
                  inputProps={{ 'aria-label': 'Automatyczne drukowanie' }}
                />
              </Box>
            </Tooltip>
            <Tooltip title={improveEnabled ? 'Ulepszanie promptu włączone' : 'Wysyłaj oryginalny prompt'} arrow>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AutoAwesomeIcon color={improveEnabled ? 'primary' : 'action'} />
                <Switch
                  size="small"
                  checked={improveEnabled}
                  onChange={(e) => onImproveChange(e.target.checked)}
                  color="primary"
                  inputProps={{ 'aria-label': 'Ulepszanie promptu' }}
                />
              </Box>
            </Tooltip>
          </Box>
          <Box
            sx={{
              mt: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: (theme) => theme.palette.background.paper,
              opacity: 0.8,
              borderRadius: 3,
              px: { xs: 0.75, sm: 1 },
              py: { xs: 0.5, sm: 0.75 },
              boxShadow: 4,
              width: 'fit-content',
              mx: 'auto',
              position: 'relative',
              zIndex: 2,
              height: { xs: 40, sm: 40 },
            }}
          >
            <Tooltip title="Odśwież sugestie" arrow>
              <Button
                variant="contained"
                onClick={refreshIdeas}
                aria-label="Generuj nowe sugestie"
                sx={{
                  minWidth: 0,
                  width: 100,
                  height: { xs: 32, sm: 36 },
                  borderRadius: 3,
                  fontSize: { xs: 18, sm: 22 },
                  padding: 0,
                  bgcolor: 'common.white',
                  color: 'text.primary',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'grey.100',
                    boxShadow: 'none',
                  },
                }}
              >
                🎲
              </Button>
            </Tooltip>
          </Box>
        </Stack>
      )}
      <Box
        sx={{
          position: 'relative',
          width: ringBoxSizePx,
          height: ringBoxSizePx,
          maxWidth: '100%',
          maxHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mt: ringClearance,
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Fab
            aria-label={status === 'recording' ? 'Generuj kolorowanke' : 'Nagraj prompt glosowy'}
            color={status === 'recording' ? 'success' : 'error'}
            size="large"
            sx={{
              width: { xs: 96, sm: 168 },
              height: { xs: 96, sm: 168 },
              animation:
                status === 'recording'
                  ? `${recordPulseSuccess} 1.4s ease-in-out infinite`
                  : canRecord
                    ? `${pulse} 1.8s ease-in-out infinite`
                    : 'none',
              '&.Mui-disabled': {
                bgcolor: status === 'recording' ? 'success.main' : 'error.main',
                color: 'common.white',
                opacity: 1,
              },
              '& svg': {
                fontSize: { xs: 36, sm: 56 },
              },
              '&:hover': {
                bgcolor: status === 'recording' ? 'success.dark' : 'error.dark',
              },
              '&:not(.Mui-disabled)': {
                cursor: 'pointer',
              },
            }}
            disabled={fabDisabled}
            onClick={status === 'recording' ? onStopRecording : canRecord ? onStartRecording : undefined}
          >
            {status === 'recording' ? <AutoAwesomeIcon sx={{ color: 'common.white' }} /> : <MicIcon />}
          </Fab>
          {status === 'recording' && (
            <Stack
              direction="column"
              spacing={0.5}
              alignItems="center"
              sx={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <Box
                aria-label="Nagrywanie – wizualizacja dźwięku"
                sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.6, height: 32 }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <Box
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    sx={{
                      width: { xs: 4, sm: 6 },
                      height: '100%',
                      transformOrigin: 'center bottom',
                      backgroundColor: 'error.main',
                      borderRadius: 1,
                      animation: `${wave} ${1.1 + (i % 5) * 0.12}s ease-in-out ${i * 0.08}s infinite`,
                      boxShadow: '0 2px 8px rgba(239,71,111,0.35)',
                    }}
                  />
                ))}
              </Box>
              <Button
                variant="contained"
                color="error"
                startIcon={<CloseIcon />}
                onClick={onCancelRecording}
                sx={{ width: { xs: 160, sm: 240 }, borderRadius: 3 }}
              >
                Anuluj
              </Button>
            </Stack>
          )}
        </Box>
        {ideasVisible && status === 'idle' && (
          <>
            {ideas.map((it, index) => {
              const angle = (index / ideas.length) * Math.PI * 2 + orbitAngle;
              const x = Math.cos(angle) * ring.radius;
              const y = Math.sin(angle) * ring.radius;
              return (
                <Tooltip title={it.label} arrow key={`${it.icon}-${index}`}>
                  <Box
                    onClick={() => {
                      const prompt = it.prompt;
                      onIdeaSelect(prompt);
                    }}
                    onMouseEnter={handleIdeaMouseEnter}
                    onMouseLeave={handleIdeaMouseLeave}
                    role="button"
                    aria-label={`Pomysł: ${it.label}`}
                    sx={{
                      position: 'absolute',
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)',
                      width: ring.item,
                      height: ring.item,
                      borderRadius: '50%',
                      bgcolor: '#FFB703',
                      color: 'primary.contrastText',
                      opacity: 0.7,
                      boxShadow: 2,
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'transform .12s ease, box-shadow .2s ease, opacity .12s ease',
                      '&:hover': {
                        transform: 'translate(-50%, -50%) scale(1.06)',
                        boxShadow: 4,
                        opacity: 1,
                      },
                      '&:active': { transform: 'translate(-50%, -50%) scale(0.96)' },
                    }}
                  >
                    <Box sx={{ fontSize: ring.emoji, lineHeight: 1 }} component="span">
                      {it.icon}
                    </Box>
                  </Box>
                </Tooltip>
              );
            })}
          </>
        )}
      </Box>
      {status !== 'recording' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', height: 18 }}>
          <BrushIcon
            fontSize="small"
            sx={{ animation: `${wiggle} 2.4s ease-in-out infinite`, transformOrigin: 'bottom center', opacity: 0.85 }}
          />
        </Box>
      )}
    </Stack>
  );
};
