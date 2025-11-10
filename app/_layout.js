// app/_layout.js (EL LAYOUT RAÍZ, CORREGIDO)
import { Stack, SplashScreen } from "expo-router"; 
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react'; 
import { AppState } from 'react-native';
import { db } from '../src/services/firebase/config';
import { enableNetwork, disableNetwork } from 'firebase/firestore'; 

// --- Imports de Tema y Toast ---
import { ThemeProvider } from '../src/hooks/useTheme';
import useTheme from '../src/hooks/useTheme';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

// --- Imports de Fuentes ---
import { 
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold 
} from '@expo-google-fonts/inter';

// -----------------------------------------------------------------
// (Opcional) Mantiene la Splash Screen visible desde el inicio
SplashScreen.preventAutoHideAsync();
// -----------------------------------------------------------------


// Componente interno para acceder a los hooks (Tema, AppState, Toast)
function AppLayout() {
  const { theme } = useTheme();

  // --- Lógica de AppState (Para bug de "estado rancio") ---
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[AppState] App ha vuelto. Forzando reconexión de Firestore...');
        disableNetwork(db)
          .then(() => enableNetwork(db))
          .then(() => console.log('[AppState] Reconexión de Firestore forzada.'));
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);
  // --- Fin Lógica AppState ---

  // --- Config de Toast (usando el tema dinámico) ---
  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: theme.colors.primary, backgroundColor: theme.colors.surface }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontFamily: 'Inter-Medium', 
          color: theme.colors.text
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: 'Inter-Regular', 
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
          fontFamily: 'Inter-Medium', 
          color: theme.colors.text
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: 'Inter-Regular', 
          color: theme.colors.textSecondary
        }}
      />
    ),
  };

  // --- JSX del Layout ---
  return (
    <>
      {/* Stack principal (Auth y App) */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background // Fondo dinámico
          }
        }}
      >
        <Stack.Screen name="index" /> 
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(app)" /> 
      </Stack>
      
      {/* Toast global */}
      <Toast config={toastConfig} />
    </>
  );
}


// --- Provider Principal (RootLayout) ---
// (Aquí es donde ocurre la "Compuerta de Carga de Fuentes")
export default function RootLayout() {

  // 1. Carga las fuentes que importamos
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
  });

  // 2. Mantiene la Splash Screen visible mientras se cargan las fuentes
  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Oculta el splash screen SOLO cuando las fuentes están listas (o si hay error)
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // 3. LA COMPUERTA: No renderiza NADA hasta que las fuentes estén listas
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // 4. Una vez cargadas, renderiza la app
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppLayout /> 
      </ThemeProvider>
    </SafeAreaProvider>
  );
}