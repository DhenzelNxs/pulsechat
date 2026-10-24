import { createTheme, type Theme } from '@mui/material/styles';

export type ColorMode = 'light' | 'dark';

export function createAppTheme(mode: ColorMode): Theme {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            background: { default: '#0f172a', paper: '#1e293b' },
          }
        : {
            background: { default: '#f8fafc', paper: '#ffffff' },
          }),
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: ['Roboto', '-apple-system', 'Segoe UI', 'sans-serif'].join(','),
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  });
}
