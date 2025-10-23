import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import useSafeArea from '../src/hooks/useSafeArea';
import { globalStyles } from '../src/styles/GlobalStyles';
import { onAuthChange, getCurrentUser } from '../src/services/firebase/auth';

export default function Welcome() {
  const { safeAreaInsets } = useSafeArea(true);
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useFocusEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        // Usar setTimeout para asegurar que el layout está montado
        setTimeout(() => {
          router.replace('/(app)');
        }, 100);
      } else {
        setIsCheckingAuth(false);
      }
    });

    // Verificación inicial
    const currentUser = getCurrentUser();
    if (currentUser) {
      setTimeout(() => {
        router.replace('/(app)');
      }, 100);
    } else {
      setIsCheckingAuth(false);
    }

    return unsubscribe;
  });

  // Mostrar loading mientras verificamos autenticación
  if (isCheckingAuth) {
    return (
      <View style={[globalStyles.container, safeAreaInsets, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text style={[globalStyles.body, { marginTop: 16 }]}>Verificando...</Text>
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      <ScrollView 
        style={globalStyles.containerWithPadding}
        contentContainerStyle={[globalStyles.scrollContent, { justifyContent: 'center', flex: 1 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Brand */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text style={[globalStyles.title, { fontSize: 32, color: '#2E86AB' }]}>
            Khipu
          </Text>
          <Text style={[globalStyles.body, { marginTop: 16, textAlign: 'center' }]}>
            Tu billetera digital simple y segura
          </Text>
        </View>

        {/* Botones de Acción */}
        <View style={{ width: '100%' }}>
          <TouchableOpacity 
            style={[globalStyles.button, globalStyles.buttonPrimary]}
            onPress={() => router.push('/login')}
          >
            <Text style={globalStyles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.button, globalStyles.buttonSecondary, { marginTop: 16 }]}
            onPress={() => router.push('/register')}
          >
            <Text style={globalStyles.buttonTextSecondary}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}