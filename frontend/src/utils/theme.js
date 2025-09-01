import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2c3e50',
    secondary: '#3498db',
    tertiary: '#27ae60',
    surface: '#ffffff',
    background: '#f8f9fa',
    error: '#e74c3c',
    warning: '#f39c12',
    success: '#27ae60',
    text: '#2c3e50',
    onSurface: '#2c3e50',
    onBackground: '#2c3e50',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    default: {
      fontFamily: 'System',
    },
  },
};

