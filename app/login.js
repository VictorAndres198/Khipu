import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

// 1. Hooks de la app
import useSafeArea from '../src/hooks/useSafeArea';
import { useGlobalStyles } from '../src/hooks/useGlobalStyles'; // 👈 ¡Usamos el hook dinámico!
import useTheme from '../src/hooks/useTheme'; // 👈 ¡Usamos el hook de tema!

// 2. Lógica de Firebase (sin cambios)
import { login, onAuthChange, getCurrentUser } from '../src/services/firebase/auth';

export default function Login() {
  const { safeAreaInsets } = useSafeArea(false);
  const router = useRouter();
  
  // 3. Obtenemos estilos y tema dinámicos
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme();

  // 4. Estado local
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // 👈 Para mostrar/ocultar contraseña

  // 5. Lógica de autenticación (sin cambios)
  useFocusEffect(() => {
    // (Tu lógica de useFocusEffect... la dejo igual)
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        setTimeout(() => router.replace('/(app)'), 100);
      } else {
        setIsCheckingAuth(false);
      }
    });
    return unsubscribe;
  });

  const handleLogin = async () => {
    // (Tu lógica de handleLogin... la dejo igual)
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Por favor completa todos los campos' });
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error de inicio de sesión', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 6. Estilos locales y dinámicos para esta pantalla
  const localStyles = useMemo(() => StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      padding: theme.spacing.md, // Un padding general
    },
    headerContainer: {
      paddingTop: theme.spacing.xl, // Reemplaza 40
      paddingBottom: theme.spacing.lg, // Reemplaza 24
    },
    headerSubtitle: {
      ...globalStyles.body,
      marginTop: theme.spacing.sm, // Reemplaza 8
      color: theme.colors.textSecondary,
    },
    formContainer: {
      marginTop: theme.spacing.xl, // Reemplaza 32
    },
    // Contenedor para Input + Icono
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
    inputIcon: {
      marginLeft: theme.spacing.md,
      color: theme.colors.textSecondary,
    },
    // El TextInput puro
    inputField: {
      flex: 1,
      paddingHorizontal: theme.spacing.sm,
      // Usamos los estilos de fuente y padding vertical del input global
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      paddingVertical: theme.spacing.sm, // 👈 Ajusta esto si es muy pequeño
    },
    // Icono para mostrar/ocultar contraseña
    passwordToggleIcon: {
      padding: theme.spacing.sm,
      marginRight: theme.spacing.xs,
      color: theme.colors.textSecondary,
    },
    primaryButtonGradient: {
      ...globalStyles.button,
    },
    secondaryButton: {
      ...globalStyles.button,
      ...globalStyles.buttonSecondary,
      marginTop: theme.spacing.sm, // Reemplaza 8
    },
    loadingText: {
      ...globalStyles.caption,
      marginTop: theme.spacing.md, // Reemplaza 16
    }
  }), [globalStyles, theme]); // Se recalculan si el tema cambia

  // --- Estado de Carga (Verificando Auth) ---
  if (isCheckingAuth) {
    return (
        // 1. 'loadingContainer' tiene el color de fondo del tema
        <View style={[globalStyles.loadingContainer, safeAreaInsets]}>
        <ActivityIndicator 
            size="large" 
            color={theme.colors.primary} // 2. Color primario del tema
        />
        <Text style={{
            ...globalStyles.body, // 3. Estilo base del tema
            marginTop: theme.spacing.md, // 4. Espacio del tema
            color: theme.colors.textSecondary // 5. Color de texto del tema
        }}>
            Verificando...
        </Text>
        </View>
    );
  }

  // --- Pantalla Principal ---
  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      <ScrollView 
        style={{ flex: 1 }} // El ScrollView ocupa todo el espacio
        contentContainerStyle={localStyles.scrollContainer} // El contenido interno tiene padding
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" // Mejora la UX con inputs
      >
        {/* Header */}
        <View style={localStyles.headerContainer}>
          <Text style={globalStyles.title}>Iniciar Sesión</Text>
          <Text style={localStyles.headerSubtitle}>
            Bienvenido de vuelta a Khipu
          </Text>
        </View>

        {/* Formulario */}
        <View style={localStyles.formContainer}>
          {/* 8. Input de Email con Icono */}
          <View style={localStyles.inputWrapper}>
            <MaterialCommunityIcons 
              name="email-outline" 
              size={20} 
              style={localStyles.inputIcon} 
            />
            <TextInput
              style={localStyles.inputField}
              placeholder="Email"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          {/* 9. Input de Contraseña con Icono y Toggle */}
          <View style={localStyles.inputWrapper}>
            <MaterialCommunityIcons 
              name="lock-outline" 
              size={20} 
              style={localStyles.inputIcon} 
            />
            <TextInput
              style={localStyles.inputField}
              placeholder="Contraseña"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible} // 👈 Controlado por estado
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <MaterialCommunityIcons 
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                size={22} 
                style={localStyles.passwordToggleIcon} 
              />
            </TouchableOpacity>
          </View>

          {/* 10. Botón Primario con Gradiente */}
          <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={[theme.colors.primaryLight, theme.colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              // Usamos el estilo global 'buttonDisabled'
              style={[
                localStyles.primaryButtonGradient, 
                loading && globalStyles.buttonDisabled 
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              ) : (
                <Text style={globalStyles.buttonText}>Iniciar Sesión</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* 11. Botón Secundario */}
          <TouchableOpacity 
            style={[
              localStyles.secondaryButton, 
              loading && globalStyles.buttonDisabled
            ]}
            onPress={() => router.push('/register')}
            disabled={loading}
          >
            <Text style={globalStyles.buttonTextSecondary}>
              ¿No tienes cuenta? Regístrate
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}