import { useContext, createContext } from 'react';
import theme from '../styles/themes';

const ThemeContext = createContext(theme);

export const ThemeProvider = ThemeContext.Provider;

export default function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}