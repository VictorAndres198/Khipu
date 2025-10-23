// app/_layout.js (EL LAYOUT RAÍZ, CORREGIDO)
import { Stack } from "expo-router"; // 1. Importar Stack
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../src/hooks/useTheme';
import useTheme from '../src/hooks/useTheme';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

// Componente interno para acceder al hook
function AppLayout() {
  const { theme } = useTheme(); // 2. Obtener tema

  // 3. Config de Toast (usando el tema dinámico)
  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: theme.colors.primary, backgroundColor: theme.colors.surface }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontFamily: 'System', 
          color: theme.colors.text
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: 'System', 
          color: theme.colors.textSecondary
        }}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: theme.colors.error, backgroundColor: theme.colors.surface }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontFamily: 'System', 
          color: theme.colors.text
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: 'System', 
          color: theme.colors.textSecondary
        }}
      />
    ),
  };

  return (
    <>
      {/* 4. ¡SOLUCIÓN AL FONDO BLANCO! */}
      {/* Este Stack controla todas las pantallas de este nivel */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background // 👈 FONDO DINÁMICO
          }
        }}
      >
        {/* Definimos explícitamente las pantallas en este nivel */}
        <Stack.Screen name="index" /> 
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(app)" /> 
      </Stack>
      
      {/* 5. Toast global */}
      <Toast config={toastConfig} />
    </>
  );
}

// Provider principal
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppLayout /> 
      </ThemeProvider>
    </SafeAreaProvider>
  );
}