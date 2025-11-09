import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    // pastel, child-friendly palette
    primary: { main: '#8E7CFF' },
    secondary: { main: '#FFD166' },
    error: { main: '#EF476F' },
    success: { main: '#06D6A0' },
    info: { main: '#73C2FB' },
  },
  shape: {
    borderRadius: 14,
  },
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
});
