// src/hooks/useTheme.js (REEMPLAZAR TODO EL ARCHIVO)

import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../styles/themes'; // Asegúrate que la ruta sea correcta

// 1. Creamos el contexto
const ThemeContext = createContext({
  theme: lightTheme, // Tema actual
  themeMode: 'system', // 'light', 'dark', 'system'
  isDarkMode: false, // booleano simple
  setThemeMode: (mode) => {}, // Función para cambiar el modo
});

// 2. Creamos el Proveedor
export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme(); // 'light' o 'dark' (del teléfono)
  const [themeMode, setThemeMode] = useState('system'); // Nuestro estado guardado

  // Efecto para cargar la preferencia guardada al iniciar
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('@theme_mode');
        if (savedMode) {
          setThemeMode(savedMode);
        }
      } catch (e) {
        console.error('Failed to load theme mode.', e);
      }
    };
    loadThemeMode();
  }, []);

  // Determinar si estamos en modo oscuro
  const isDarkMode = useMemo(() => {
    if (themeMode === 'system') return systemScheme === 'dark';
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  // Obtener el objeto de tema correcto (light o dark)
  const theme = useMemo(() => {
    return isDarkMode ? darkTheme : lightTheme;
  }, [isDarkMode]);

  // Función para cambiar y guardar el modo
  const handleSetThemeMode = async (mode) => {
    try {
      await AsyncStorage.setItem('@theme_mode', mode);
      setThemeMode(mode);
    } catch (e) {
      console.error('Failed to save theme mode.', e);
    }
  };

  // El valor que pasaremos al provider
  const value = useMemo(() => ({
    theme,
    themeMode,
    isDarkMode,
    setThemeMode: handleSetThemeMode,
  }), [theme, themeMode, isDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Creamos el Hook (este es el que usarás en tus pantallas)
export default function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}