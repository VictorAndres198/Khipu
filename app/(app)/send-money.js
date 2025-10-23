import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// 1. Hooks de la App
import useSafeArea from '../../src/hooks/useSafeArea';
import { useGlobalStyles } from '../../src/hooks/useGlobalStyles'; // 👈 Dinámico
import useTheme from '../../src/hooks/useTheme'; // 👈 Dinámico

// 2. Firebase
import { getCurrentUser } from '../../src/services/firebase/auth';
import { findUserByPhone, sendMoney, listenToUser } from '../../src/services/firebase/firestore';

const searchSchema = yup.object().shape({
  telefono: yup
    .string()
    .matches(/^[0-9]+$/, 'Solo números')
    .min(9, 'Teléfono no válido (mín. 9 dígitos)')
    .required('El teléfono es requerido'),
});

export default function SendMoney() {
  // 3. Hooks
  const { safeAreaInsets } = useSafeArea(true); // 👈 'true' para padding inferior
  const router = useRouter();
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme();
  
  // 4. Estados (sin cambios en la lógica)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [userData, setUserData] = useState(null);

  const sendSchema = useMemo(() => {
    const saldoActual = userData?.saldo || 0; 
    
    return yup.object().shape({
      monto: yup
        .number()
        .typeError('Debe ser un monto válido') // Si escriben "abc"
        .positive('El monto debe ser positivo')
        .max(saldoActual, `Saldo insuficiente (Tienes S/ ${saldoActual.toFixed(2)})`)
        .required('El monto es requerido'),
      descripcion: yup
        .string()
        .max(100, 'Máximo 100 caracteres'),
    });
  }, [userData]);

  // 5. Lógica (sin cambios)
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const unsubscribe = listenToUser(user.uid, setUserData);
      return unsubscribe;
    }
  }, []);

  const { 
    control: controlSearch, 
    handleSubmit: handleSubmitSearch, 
    formState: { errors: errorsSearch } 
  } = useForm({
    resolver: yupResolver(searchSchema),
    mode: 'onBlur',
  });

  // ✅ FORMULARIO 2: Para enviar monto
  const { 
    control: controlSend, 
    handleSubmit: handleSubmitSend, 
    formState: { errors: errorsSend },
    watch: watchSend // 👈 Usaremos 'watch' para el botón
  } = useForm({
    resolver: yupResolver(sendSchema),
    mode: 'onChange', // 'onChange' es mejor para montos
  });

  const montoActual = watchSend('monto');

  const onSearchSubmit = async (data) => {
    // 'data' es { telefono: '...' }
    setSearching(true);
    setFoundUser(null); // Resetea si busca de nuevo
    try {
      const user = await findUserByPhone(data.telefono);
      setFoundUser(user);
      if (!user) {
        Toast.show({ type: 'error', text1: 'Usuario no encontrado' });
      }
      // Si se encuentra, el 'if (foundUser)' en el JSX mostrará el Formulario 2
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo buscar el usuario' });
    } finally {
      setSearching(false);
    }
  };

  const onSendSubmit = async (data) => {
    // 'data' es { monto: 123, descripcion: '...' }
    // Ya no necesitas validar el saldo, Yup lo hizo
    setSending(true);
    try {
      await sendMoney(
        getCurrentUser().uid, 
        foundUser.telefono, // 👈 Usamos el 'foundUser' del estado
        data.monto, 
        data.descripcion || 'Transferencia'
      );
      Toast.show({ 
        type: 'success', 
        text1: 'Transferencia exitosa',
        onHide: () => router.back()
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error al enviar', text2: error.message });
    } finally {
      setSending(false);
    }
  };

  
  // 6. Estilos locales dinámicos
  const localStyles = useMemo(() => StyleSheet.create({
    scrollContainer: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    headerContainer: {
      paddingBottom: theme.spacing.lg,
    },
    headerSubtitle: {
      ...globalStyles.body,
      marginTop: theme.spacing.sm,
      color: theme.colors.textSecondary,
    },
    // Tarjeta de Saldo
    balanceCard: {
      ...globalStyles.card,
      backgroundColor: theme.colors.surfaceVariant, // 👈 Gris claro
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.md,
    },
    balanceTitle: {
      ...globalStyles.title,
      color: theme.colors.primary, // 👈 Verde menta
      fontSize: theme.typography.fontSize.xl,
    },
    // Tarjeta de Sección
    sectionCard: {
      ...globalStyles.card,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...globalStyles.subtitle,
      marginBottom: theme.spacing.md,
    },
    // Estilos de Input (copiados de Login/Register)
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
    // Botón de Gradiente
    gradientButton: {
      ...globalStyles.button,
    },
    // Tarjeta de Usuario Encontrado (NUEVO DISEÑO)
    foundUserContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.md,
      padding: theme.spacing.md, 
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.success, // 👈 Borde verde
    },
    foundUserIconContainer: {
      backgroundColor: theme.colors.success,
      borderRadius: theme.borderRadius.round,
      padding: theme.spacing.xs,
      marginRight: theme.spacing.sm,
    },
    foundUserTextContainer: {
      flex: 1,
    },
    foundUserName: {
      ...globalStyles.body,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.text,
    },
    foundUserPhone: {
      ...globalStyles.caption,
    },
    errorText: {
      color: theme.colors.error,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.sm,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
  }), [globalStyles, theme]);
  
  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      <ScrollView 
        contentContainerStyle={localStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={localStyles.headerContainer}>
          <Text style={globalStyles.title}>Enviar Dinero</Text>
          <Text style={localStyles.headerSubtitle}>
            Transfiere dinero a otro usuario de Khipu
          </Text>
        </View>

        {/* Tu saldo actual */}
        <View style={localStyles.balanceCard}>
          <Text style={globalStyles.caption}>Tu saldo disponible</Text>
          <Text style={localStyles.balanceTitle}>
            S/ {userData?.saldo?.toFixed(2) || '0.00'}
          </Text>
        </View>

        {/* Buscar usuario */}
        <View style={localStyles.sectionCard}>
          <Text style={localStyles.sectionTitle}>
            1. Buscar Usuario
          </Text>
          
        <View style={localStyles.inputWrapper}>
            <MaterialCommunityIcons name="phone" size={20} style={localStyles.inputIcon} />
            
            {/* ✅ Controlador para 'telefono' */}
            <Controller
              control={controlSearch}
              name="telefono"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={localStyles.inputField}
                  placeholder="Número de teléfono"
                  placeholderTextColor={theme.colors.textSecondary}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="phone-pad"
                  editable={!searching && !sending}
                />
              )}
            />
          </View>
          {/* ✅ Muestra error de 'telefono' */}
          {errorsSearch.telefono && (
            <Text style={localStyles.errorText}>{errorsSearch.telefono.message}</Text>
          )}

          <TouchableOpacity 
            // ✅ Usa el 'handleSubmit' del Formulario 1
            onPress={handleSubmitSearch(onSearchSubmit)}
            disabled={searching}
          >
            <LinearGradient
              colors={[theme.colors.primaryLight, theme.colors.primary]}
              style={[
                localStyles.gradientButton,
                searching && globalStyles.buttonDisabled
              ]}
            >
              {searching ? (
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              ) : (
                <Text style={globalStyles.buttonText}>Buscar Usuario</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Resultado de búsqueda */}
          {foundUser && (
            <View style={localStyles.foundUserContainer}>
              <View style={localStyles.foundUserIconContainer}>
                <MaterialCommunityIcons name="check" size={16} color={theme.colors.onPrimary} />
              </View>
              <View style={localStyles.foundUserTextContainer}>
                <Text style={localStyles.foundUserName}>
                  {foundUser.nombre}
                </Text>
                <Text style={localStyles.foundUserPhone}>
                  {foundUser.telefono}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Detalles de transferencia (solo si se encontró usuario) */}
        {foundUser && (
          <View style={[localStyles.sectionCard]}>
            <Text style={localStyles.sectionTitle}>
              2. Detalles de Transferencia
            </Text>
            
            {/* ✅ Controlador para 'monto' */}
            <View style={localStyles.inputWrapper}>
              <MaterialCommunityIcons name="cash" size={20} style={localStyles.inputIcon} />
              <Controller
                control={controlSend}
                name="monto"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={localStyles.inputField}
                    placeholder="Monto (S/)"
                    placeholderTextColor={theme.colors.textSecondary}
                    onBlur={onBlur}
                    // 'onChange' espera un string, 'value' es un número
                    onChangeText={onChange} 
                    value={value?.toString()} // 
                    keyboardType="decimal-pad"
                    editable={!sending}
                  />
                )}
              />
            </View>
            {/* ✅ Muestra error de 'monto' */}
            {errorsSend.monto && (
              <Text style={localStyles.errorText}>{errorsSend.monto.message}</Text>
            )}

            {/* ✅ Controlador para 'descripcion' */}
            <View style={[localStyles.inputWrapper, { marginTop: theme.spacing.sm }]}>
              <MaterialCommunityIcons name="text-short" size={20} style={localStyles.inputIcon} />
              <Controller
                control={controlSend}
                name="descripcion"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={localStyles.inputField}
                    placeholder="Descripción (opcional)"
                    placeholderTextColor={theme.colors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ''}
                    editable={!sending}
                  />
                )}
              />
            </View>
            {/* ✅ Muestra error de 'descripcion' */}
            {errorsSend.descripcion && (
              <Text style={localStyles.errorText}>{errorsSend.descripcion.message}</Text>
            )}

            <TouchableOpacity 
              // ✅ Usa el 'handleSubmit' del Formulario 2
              onPress={handleSubmitSend(onSendSubmit)}
              disabled={sending}
              style={{ marginTop: theme.spacing.md }}
            >
              <LinearGradient
                colors={[theme.colors.primaryLight, theme.colors.primary]}
                style={[
                  localStyles.gradientButton,
                  sending && globalStyles.buttonDisabled
                ]}
              >
                {sending ? (
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                ) : (
                  <Text style={globalStyles.buttonText}>
                    {/* ✅ Usa el valor de 'watch' */}
                    Enviar S/ {montoActual || '0.00'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}