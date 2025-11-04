// app/(app)/_layout.js (EL NUEVO LAYOUT STACK)
import { Stack } from 'expo-router';
import useTheme from '../../src/hooks/useTheme';

export default function AppLayout() {
  const { theme } = useTheme(); // 1. Obtenemos el tema dinámico

  return (
    <Stack
      screenOptions={{
        // 2. ¡LA SOLUCIÓN AL FLASH BLANCO!
        // Fija el color de fondo del navegador
        contentStyle: {
          backgroundColor: theme.colors.background
        },
        
        // 3. Ocultamos el header de este Stack
        // (Tus pantallas tienen sus propios headers)
        headerShown: false, 
      }}
    >
      {/* 4. Apunta a la carpeta (tabs) como la ruta principal */}
      <Stack.Screen
        name="(tabs)"
      />
      
      {/* 5. Define las otras pantallas (las que NO tienen tab bar) */}
      <Stack.Screen
        name="sendMoneyCentral" // (app)/sendMoneyCentral.js
        options={{
          headerShown: false, // Ocultamos el header por defecto
          presentation: 'modal' // Opcional: para que deslice desde abajo
        }}
      />

      <Stack.Screen
        name="transactions/index" // (app)/transactions/index.js
      />
      <Stack.Screen
        name="transactions/[id]" // (app)/transactions/[id].js
      />
      
      <Stack.Screen
        name="my-qr" // apunta a app/(app)/my-qr.js
        options={{
          presentation: 'modal', // Se desliza desde abajo
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="scanner" // apunta a app/(app)/scanner.js
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />

    </Stack>
  );
}