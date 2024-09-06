import { createTheme, ThemeOptions } from '@mui/material/styles';

export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#165aaf',
    },
    secondary: {
      main: '#0e0441',
    },
  },
};

const theme = createTheme(themeOptions);

export default theme;