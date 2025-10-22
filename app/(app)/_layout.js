import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Animaciones bonitas para toda la app
        animation: 'slide_from_right',
      }}
    >
      {/* El grupo de tabs - se muestra por defecto */}
      <Stack.Screen name="(tabs)" />
      
      {/* El grupo de transacciones - se abre como modal */}
      <Stack.Screen 
        name="transactions" 
        options={{
          presentation: 'modal', // ← Esto hace que se abra como modal
          animation: 'slide_from_bottom', // Animación de modal
        }}
      />
    </Stack>
  );
}