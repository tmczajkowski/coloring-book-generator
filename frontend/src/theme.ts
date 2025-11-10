import { createTheme } from '@mui/material/styles';

const AMBER = '#FFB703';
const ORANGE = '#FB8500';

export const theme = createTheme({
  palette: {
    mode: 'light',
    // vibrant, kid-friendly palette (no purple)
    primary: { main: ORANGE },
    secondary: { main: '#00B4D8' },
    error: { main: '#EF476F' },
    success: { main: '#34D399' },
    info: { main: '#60A5FA' },
    background: { default: '#FFFDF6', paper: '#FFFFFF' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: [
      'system-ui',
      '-apple-system',
      'Segoe UI',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FFFDF6',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(90deg, ${AMBER} 0%, ${ORANGE} 100%)`,
          backgroundColor: 'transparent',
          color: '#fff',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        colorError: {
          backgroundImage: 'linear-gradient(135deg, #FF4D6D 0%, #EF476F 100%)',
          color: '#fff',
          '&:hover': {
            filter: 'brightness(0.95)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 14 },
        containedSuccess: { boxShadow: '0 6px 16px rgba(52, 211, 153, 0.35)' },
        containedInfo: { boxShadow: '0 6px 16px rgba(96, 165, 250, 0.35)' },
        containedError: { boxShadow: '0 6px 16px rgba(239, 71, 111, 0.35)' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
      },
    },
  },
});
