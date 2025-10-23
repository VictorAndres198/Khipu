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
import { useGlobalStyles } from '../src/hooks/useGlobalStyles'; // 👈 Hook dinámico
import useTheme from '../src/hooks/useTheme'; // 👈 Hook de tema

// 2. Lógica de Firebase (sin cambios)
import { register, onAuthChange, getCurrentUser } from '../src/services/firebase/auth';

export default function Register() {
  const { safeAreaInsets } = useSafeArea(false);
  const router = useRouter();
  
  // 3. Obtenemos estilos y tema dinámicos
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme();

  // 4. Estado local
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    password: ''
  });
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

  const handleRegister = async () => {
    // (Tu lógica de handleRegister... la dejo igual)
    const { nombre, telefono, email, password } = formData;
    if (!nombre || !telefono || !email || !password) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Por favor completa todos los campos' });
      return;
    }
    setLoading(true);
    try {
      await register(email, password, { nombre, telefono });
      Toast.show({ type: 'success', text1: '¡Cuenta creada!', text2: 'Bienvenido a Khipu' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error de inicio de sesión', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 6. Estilos locales y dinámicos para esta pantalla
  const localStyles = useMemo(() => StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      padding: theme.spacing.md,
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
    // Contenedor para Input + Icono (igual que en Login)
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
    inputField: {
      flex: 1,
      paddingHorizontal: theme.spacing.sm,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      paddingVertical: theme.spacing.sm,
    },
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
  }), [globalStyles, theme]);

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
        style={{ flex: 1 }}
        contentContainerStyle={localStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={localStyles.headerContainer}>
          <Text style={globalStyles.title}>Crear Cuenta</Text>
          <Text style={localStyles.headerSubtitle}>
            Únete a Khipu y empieza a enviar dinero
          </Text>
        </View>

        {/* Formulario */}
        <View style={localStyles.formContainer}>
          {/* 7. Inputs con Iconos */}
          <View style={localStyles.inputWrapper}>
            <MaterialCommunityIcons 
              name="account-outline" 
              size={20} 
              style={localStyles.inputIcon} 
            />
            <TextInput
              style={localStyles.inputField}
              placeholder="Nombre completo"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.nombre}
              onChangeText={(value) => updateField('nombre', value)}
              editable={!loading}
            />
          </View>
          
          <View style={localStyles.inputWrapper}>
            <MaterialCommunityIcons 
              name="phone-outline" 
              size={20} 
              style={localStyles.inputIcon} 
            />
            <TextInput
              style={localStyles.inputField}
              placeholder="Teléfono"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.telefono}
              onChangeText={(value) => updateField('telefono', value)}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

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
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

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
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry={!isPasswordVisible}
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

          {/* 8. Botón Primario con Gradiente */}
          <TouchableOpacity 
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient
              colors={[theme.colors.primaryLight, theme.colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                localStyles.primaryButtonGradient, 
                loading && globalStyles.buttonDisabled
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              ) : (
                <Text style={globalStyles.buttonText}>Crear Cuenta</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* 9. Botón Secundario */}
          <TouchableOpacity 
            style={[
              localStyles.secondaryButton, 
              loading && globalStyles.buttonDisabled
            ]}
            onPress={() => router.push('/login')}
            disabled={loading}
          >
            <Text style={globalStyles.buttonTextSecondary}>
              ¿Ya tienes cuenta? Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}