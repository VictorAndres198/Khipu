import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { onAuthChange, getCurrentUser } from '../../src/services/firebase/auth';
import { ActivityIndicator, View } from 'react-native';
import { globalStyles } from '../../src/styles/GlobalStyles';

export default function AppLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      // Si no hay usuario autenticado y estamos en una ruta de la app, redirigir al login
      if (!user && segments[0] === '(app)') {
        router.replace('/login');
      }
    });

    // Verificación inicial
    const currentUser = getCurrentUser();
    if (!currentUser && segments[0] === '(app)') {
      router.replace('/login');
    }

    return unsubscribe;
  }, [segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}