// src/hooks/useGlobalStyles.js
import { useMemo } from 'react';
import { createGlobalStyles } from '../styles/GlobalStyles'; 
import useTheme from './useTheme'; // 👈 Importa el NUEVO hook

export const useGlobalStyles = () => {
  // 1. Extraemos el 'theme' del objeto
  const { theme } = useTheme(); 

  const styles = useMemo(() => createGlobalStyles(theme), [theme]);
  
  return styles;
};