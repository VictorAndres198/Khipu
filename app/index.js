// app/index.js (CÓDIGO CORREGIDO Y COMPLETO)

import React, { useMemo, useState, useEffect } from 'react'; // 👈 1. Importar useState y useEffect
import { 
  View, 
  Text, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router'; // 👈 2. Importar useFocusEffect
import { LinearGradient } from 'expo-linear-gradient'; 
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useGlobalStyles } from '../src/hooks/useGlobalStyles'; 
import useTheme from '../src/hooks/useTheme';
import useSafeArea from '../src/hooks/useSafeArea';

// 3. Importar tus funciones de auth de Firebase
import { onAuthChange, getCurrentUser } from '../src/services/firebase/auth';

export default function InitialScreen() {
  const router = useRouter();
  const { safeAreaInsets } = useSafeArea(false); 
  const globalStyles = useGlobalStyles(); 
  const { theme } = useTheme(); 
  
  // 4. Este estado ahora SÍ será controlado
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 5. ¡LA LÓGICA QUE FALTABA!
  // Esto revisa el estado de autenticación cuando la pantalla carga
  useFocusEffect(
    React.useCallback(() => {
      const checkAuth = () => {
        // Primero, revisa si ya hay un usuario (más rápido)
        const user = getCurrentUser();
        if (user) {
          router.replace('/(app)'); // Si hay, redirige
          return; // No necesitamos el listener
        }

        // Si no hay, activa el listener
        const unsubscribe = onAuthChange((user) => {
          if (user) {
            // Si el usuario inicia sesión (ej. en otra pestaña)
            router.replace('/(app)');
          } else {
            // Si el listener confirma que NO hay usuario,
            // deja de cargar y muestra los botones de login/registro
            setIsCheckingAuth(false);
          }
        });

        return () => unsubscribe(); // Limpia el listener al salir
      };

      checkAuth();
    }, [router])
  );
  
  // (Estilos locales... sin cambios)
  const localStyles = useMemo(() => StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: theme.spacing.md,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xxl, 
    },
    brandTitle: {
      ...globalStyles.title, 
      fontSize: theme.typography.fontSize.xxxl, 
      color: theme.colors.primary, 
    },
    tagline: {
      ...globalStyles.body,
      marginTop: theme.spacing.md, 
      textAlign: 'center',
    },
    primaryButtonGradient: {
      ...globalStyles.button, 
    },
    secondaryButton: {
      ...globalStyles.button,
      ...globalStyles.buttonSecondary,
      marginTop: theme.spacing.md, 
    },
    loadingText: {
      ...globalStyles.body,
      marginTop: theme.spacing.md,
      color: theme.colors.textSecondary,
    }
  }), [globalStyles, theme]);

  // --- Estado de Carga (Loading) ---
  // (Este return ahora es temporal, hasta que 'isCheckingAuth' sea false)
  if (isCheckingAuth) {
    return (
      <View style={[globalStyles.loadingContainer, safeAreaInsets]}>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary} 
        />
        <Text style={localStyles.loadingText}>
          Verificando...
        </Text>
      </View>
    );
  }
  
  // --- Pantalla Principal ---
  // (Esta pantalla solo se mostrará si 'isCheckingAuth' es false)
  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      <ScrollView 
        contentContainerStyle={localStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Brand */}
        <View style={localStyles.logoContainer}>
          <Text style={localStyles.brandTitle}>
            Khipu
          </Text>
          <Text style={localStyles.tagline}>
            Tu billetera digital simple y segura
          </Text>
        </View>

        {/* Botones de Acción */}
        <View style={{ width: '100%' }}>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <LinearGradient
              colors={[theme.colors.primaryLight, theme.colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={localStyles.primaryButtonGradient}
            >
              <Text style={globalStyles.buttonText}>Iniciar Sesión</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={localStyles.secondaryButton}
            onPress={() => router.push('/register')}
          >
            <Text style={globalStyles.buttonTextSecondary}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}