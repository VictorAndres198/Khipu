import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Toast from 'react-native-toast-message';

// 1. Hooks de la app
import useSafeArea from '../src/hooks/useSafeArea';
import { useGlobalStyles } from '../src/hooks/useGlobalStyles'; // 👈 Hook dinámico
import useTheme from '../src/hooks/useTheme'; // 👈 Hook de tema

// 2. Lógica de Firebase (sin cambios)
import { register, onAuthChange, getCurrentUser } from '../src/services/firebase/auth';
// ApiCentral Importación
import { registerWalletInHub } from '../src/services/Api/centralApi';

const registerSchema = yup.object().shape({
  nombre: yup
    .string()
    .required('Tu nombre es requerido'),
  telefono: yup
    .string()
    .matches(/^[0-9]+$/, 'Solo debe contener números')
    .min(9, 'Debe ser un teléfono válido')
    .required('El teléfono es requerido'),
  email: yup
    .string()
    .email('Por favor, ingresa un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
  
  // (OPCIONAL: Si quieres añadir un campo "Confirmar Contraseña")
  // passwordConfirm: yup
  //   .string()
  //   .oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden')
  //   .required('Confirma tu contraseña'),
});

export default function Register() {
  const { safeAreaInsets } = useSafeArea(false);
  const router = useRouter();
  
  // 3. Obtenemos estilos y tema dinámicos
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme();

  // 4. Estado local
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // 👈 Para mostrar/ocultar contraseña


const { 
    control, // Conecta los inputs
    handleSubmit, // Maneja el envío
    formState: { errors } // Objeto con los mensajes de error
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onBlur', // Valida cuando el usuario sale del input
  });

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

  const onSubmit = async (data) => {
    setLoading(true);
    let createdFirebaseUser = null; // Variable para saber si necesitamos hacer rollback

    try {
      // --- PASO 1: REGISTRO INTERNO (Firebase) ---
      // 'register' devuelve el objeto 'user'
      createdFirebaseUser = await register(data.email, data.password, { 
        nombre: data.nombre, 
        telefono: data.telefono 
      });

      // --- PASO 2: REGISTRO EXTERNO (API Central) ---
      const centralData = {
        userIdentifier: data.telefono,
        internalWalletId: createdFirebaseUser.uid, // Usamos el 'uid' del usuario creado
        userName: data.nombre
      };

      const centralResponse = await registerWalletInHub(centralData);

      if (!centralResponse.success) {
        // Si el API Central falla, lanzamos un error
        // Esto detendrá la ejecución y nos enviará al bloque 'catch'
        throw new Error(centralResponse.message || "No se pudo registrar en el Hub Central.");
      }

      // --- PASO 3: ÉXITO TOTAL ---
      console.log("¡Usuario registrado en Firebase y en el Hub Central!");
      Toast.show({ 
        type: 'success', 
        text1: '¡Cuenta creada!',
        text2: 'Bienvenido a Khipu.'
      });
      // (El onAuthChange se encargará de la redirección)

    } catch (error) {
      // --- PASO 4: MANEJO DE ERROR Y ROLLBACK ---
      console.error("Error en el doble registro:", error);

      // SI 'createdFirebaseUser' NO es null, significa que el Paso 1 (Firebase) tuvo éxito
      // pero el Paso 2 (API Central) falló. ¡Debemos hacer rollback!
      if (createdFirebaseUser) {
        console.warn("Fallo en API Central. Iniciando rollback de Firebase...");
        
        try {
          // Intentamos borrar el usuario de Firebase que acabamos de crear
          await deleteCurrentUserAccount();
          // Informamos al usuario que el registro falló pero fue limpiado
          Toast.show({ 
            type: 'error', 
            text1: 'Registro fallido', 
            text2: 'No se pudo conectar al Hub Central. Inténtalo de nuevo.' 
          });
        } catch (deleteError) {
          // ¡EL PEOR ESCENARIO! No se pudo hacer el rollback.
          console.error("¡ERROR CRÍTICO DE ROLLBACK!", deleteError);
          Toast.show({ 
            type: 'error', 
            text1: 'Error Crítico', 
            text2: 'Usuario creado sin conexión al Hub. Contacte a soporte.' 
          });
        }
        
      } else {
        // Si 'createdFirebaseUser' es null, el error ocurrió en el PASO 1 (Firebase)
        // (ej. "email-already-in-use"). No hay nada que revertir.
        Toast.show({ 
          type: 'error', 
          text1: 'Error al crear cuenta', 
          text2: error.message 
        });
      }

    } finally {
      setLoading(false);
    }
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
      color: theme.colors.text,
    },
    // Estilo para el texto de error
    errorText: {
      color: theme.colors.error,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.sm,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
      marginBottom: theme.spacing.sm, // Espacio antes del siguiente input
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
{/* 1. Input de Nombre */}
        <View style={localStyles.inputWrapper}>
          <MaterialCommunityIcons name="account-outline" size={20} style={localStyles.inputIcon} />
          <Controller
            control={control}
            name="nombre" // 👈 Coincide con registerSchema
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={localStyles.inputField}
                placeholder="Nombre completo"
                placeholderTextColor={theme.colors.textSecondary}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="words" // 👈 Mejor para nombres
                editable={!loading}
              />
            )}
          />
        </View>
        {/* Muestra el error de 'nombre' si existe */}
        {errors.nombre && (
          <Text style={localStyles.errorText}>{errors.nombre.message}</Text>
        )}

        {/* 2. Input de Teléfono */}
        <View style={[localStyles.inputWrapper, { marginTop: theme.spacing.sm }]}>
          <MaterialCommunityIcons name="phone-outline" size={20} style={localStyles.inputIcon} />
          <Controller
            control={control}
            name="telefono" // 👈 Coincide con registerSchema
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={localStyles.inputField}
                placeholder="Teléfono"
                placeholderTextColor={theme.colors.textSecondary}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="phone-pad" // 👈 Teclado numérico
                editable={!loading}
              />
            )}
          />
        </View>
        {/* Muestra el error de 'telefono' si existe */}
        {errors.telefono && (
          <Text style={localStyles.errorText}>{errors.telefono.message}</Text>
        )}

        {/* 3. Input de Email */}
        <View style={[localStyles.inputWrapper, { marginTop: theme.spacing.sm }]}>
          <MaterialCommunityIcons name="email-outline" size={20} style={localStyles.inputIcon} />
          <Controller
            control={control}
            name="email" // 👈 Coincide con registerSchema
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={localStyles.inputField}
                placeholder="Email"
                placeholderTextColor={theme.colors.textSecondary}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            )}
          />
        </View>
        {/* Muestra el error de 'email' si existe */}
        {errors.email && (
          <Text style={localStyles.errorText}>{errors.email.message}</Text>
        )}

        {/* 4. Input de Contraseña */}
        <View style={[localStyles.inputWrapper, { marginTop: theme.spacing.sm }]}>
          <MaterialCommunityIcons name="lock-outline" size={20} style={localStyles.inputIcon} />
          <Controller
            control={control}
            name="password" // 👈 Coincide con registerSchema
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={localStyles.inputField}
                placeholder="Contraseña"
                placeholderTextColor={theme.colors.textSecondary}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry={!isPasswordVisible}
                editable={!loading}
              />
            )}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <MaterialCommunityIcons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={22} 
              style={localStyles.passwordToggleIcon} 
            />
          </TouchableOpacity>
        </View>
        {/* Muestra el error de 'password' si existe */}
        {errors.password && (
          <Text style={localStyles.errorText}>{errors.password.message}</Text>
        )}

        {/* 5. Botón de Envío */}
        <TouchableOpacity 
          onPress={handleSubmit(onSubmit)} // 👈 Llama a tu función de Register
          disabled={loading}
          style={{ marginTop: theme.spacing.md }} // 👈 Espacio antes del botón
        >
          <LinearGradient
            colors={[theme.colors.primaryLight, theme.colors.primary]}
            style={[
              localStyles.primaryButtonGradient,
              loading && globalStyles.buttonDisabled
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <Text style={globalStyles.buttonText}>Crear Cuenta</Text> // 👈 Texto cambiado
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