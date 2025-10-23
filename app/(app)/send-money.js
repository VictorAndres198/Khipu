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

import { useLocalSearchParams } from 'expo-router'; 
import { getUser } from '../../src/services/firebase/firestore'; 

import Toast from 'react-native-toast-message';
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import useSafeArea from '../../src/hooks/useSafeArea';
import { useGlobalStyles } from '../../src/hooks/useGlobalStyles'; 
import useTheme from '../../src/hooks/useTheme';

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
  const { safeAreaInsets } = useSafeArea(true); 
  const router = useRouter();
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme();

  const { scannedUid } = useLocalSearchParams(); 
  const [foundUser, setFoundUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false); 
  const [isPreloaded, setIsPreloaded] = useState(false); 
  const [sending, setSending] = useState(false);
  const [userData, setUserData] = useState(null);

  const sendSchema = useMemo(() => {
    const saldoActual = userData?.saldo || 0; 
    
    return yup.object().shape({
      monto: yup
        .number()
        .typeError('Debe ser un monto válido')
        .positive('El monto debe ser positivo')
        .max(saldoActual, `Saldo insuficiente (Tienes S/ ${saldoActual.toFixed(2)})`)
        .required('El monto es requerido'),
      descripcion: yup
        .string()
        .max(100, 'Máximo 100 caracteres'),
    });
  }, [userData]);


  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const unsubscribe = listenToUser(user.uid, setUserData);
      return unsubscribe;
    }
  }, []);
  

  useEffect(() => {
    if (scannedUid) {
      setIsPreloaded(true); 
      setIsSearching(true); 
      
      const loadUserFromScan = async () => {
        try {
          const user = await getUser(scannedUid); 
          if (user) {
            setFoundUser(user);
            setValueSearch('telefono', user.telefono, { shouldValidate: true });
          } else {
            Toast.show({ type: 'error', text1: 'Usuario no encontrado', text2: 'El QR no es válido.' });
            setIsPreloaded(false); 
          }
        } catch (error) {
          Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo leer el QR.' });
          setIsPreloaded(false);
        } finally {
          setIsSearching(false);
        }
      };
      loadUserFromScan();
    }
  }, [scannedUid, setValueSearch]);

  const { 
    control: controlSearch, 
    handleSubmit: handleSubmitSearch, 
    formState: { errors: errorsSearch },
    setValue: setValueSearch 
  } = useForm({
    resolver: yupResolver(searchSchema),
    mode: 'onBlur',
  });

  const { 
    control: controlSend, 
    handleSubmit: handleSubmitSend, 
    formState: { errors: errorsSend },
    watch: watchSend 
  } = useForm({
    resolver: yupResolver(sendSchema),
    mode: 'onChange',
  });

  const montoActual = watchSend('monto');

  const onSearchSubmit = async (data) => {
    setIsSearching(true);
    setFoundUser(null); 
    try {
      const user = await findUserByPhone(data.telefono);
      setFoundUser(user);
      if (!user) {
        Toast.show({ type: 'error', text1: 'Usuario no encontrado' });
      }
      
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo buscar el usuario' });
    } finally {
      setIsSearching(false);
    }
  };

  const onSendSubmit = async (data) => {
    setSending(true);
    try {
      await sendMoney(
        getCurrentUser().uid, 
        foundUser.telefono, 
        data.monto, 
        data.descripcion || 'Transferencia'
      );
      Toast.show({ 
        type: 'success', 
        text1: 'Transferencia exitosa',
        onHide: () => router.push('/(app)/(tabs)/home')
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error al enviar', text2: error.message });
    } finally {
      setSending(false);
    }
  };

  
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
    balanceCard: {
      ...globalStyles.card,
      backgroundColor: theme.colors.surfaceVariant, 
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.md,
    },
    balanceTitle: {
      ...globalStyles.title,
      color: theme.colors.primary, 
      fontSize: theme.typography.fontSize.xl,
    },
    sectionCard: {
      ...globalStyles.card,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...globalStyles.subtitle,
      marginBottom: theme.spacing.md,
    },
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
    gradientButton: {
      ...globalStyles.button,
    },
    foundUserContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.md,
      padding: theme.spacing.md, 
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.success, 
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
        <View style={localStyles.headerContainer}>
          <Text style={globalStyles.title}>Enviar Dinero</Text>
          <Text style={localStyles.headerSubtitle}>
            Transfiere dinero a otro usuario de Khipu
          </Text>
        </View>
 
        <View style={localStyles.balanceCard}>
          <Text style={globalStyles.caption}>Tu saldo disponible</Text>
          <Text style={localStyles.balanceTitle}>
            S/ {userData?.saldo?.toFixed(2) || '0.00'}
          </Text>
        </View>
 
        {!(isPreloaded && foundUser) && ( 
          <View style={localStyles.sectionCard}> 
            <Text style={localStyles.sectionTitle}>
              1. Buscar Usuario
            </Text>
             
            <View style={localStyles.inputWrapper}> 
              <MaterialCommunityIcons name="phone" size={20} style={localStyles.inputIcon} />
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
                    value={value || ''} 
                    keyboardType="phone-pad"
                    editable={!isSearching && !sending && !isPreloaded}
                  />
                )}
              /> 
              <TouchableOpacity onPress={() => router.push('/(app)/scanner')}>
                  <MaterialCommunityIcons name="qrcode-scan" size={22} 
                    style={localStyles.passwordToggleIcon || { padding: theme.spacing.sm, color: theme.colors.textSecondary }} 
                  />
              </TouchableOpacity>
            </View> 
 
            {errorsSearch.telefono && (
              <Text style={localStyles.errorText}>{errorsSearch.telefono.message}</Text>
            )}
 
            <TouchableOpacity 
              onPress={handleSubmitSearch(onSearchSubmit)}
              disabled={isSearching || isPreloaded}
 
              style={!errorsSearch.telefono ? { marginTop: theme.spacing.md } : {}} 
            >
              <LinearGradient
                colors={[theme.colors.primaryLight, theme.colors.primary]}
                style={[
                  localStyles.gradientButton,
                  (isSearching || isPreloaded) && globalStyles.buttonDisabled
                ]}
              >
                {isSearching ? (
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                ) : (
                  <Text style={globalStyles.buttonText}>Buscar Usuario</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
 

          </View>  
        )}  
 
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
 
        {foundUser && (
          <View style={localStyles.sectionCard}>  
            <Text style={localStyles.sectionTitle}>
              2. Detalles de Transferencia
            </Text>
             
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
                    onChangeText={onChange} 
                    value={value?.toString() || ''} 
                    keyboardType="decimal-pad"
                    editable={!sending}
                  />
                )}
              />
            </View>  
            {errorsSend.monto && (
              <Text style={localStyles.errorText}>{errorsSend.monto.message}</Text>
            )}
 
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
            {errorsSend.descripcion && (
              <Text style={localStyles.errorText}>{errorsSend.descripcion.message}</Text>
            )}
 
            <TouchableOpacity 
              onPress={handleSubmitSend(onSendSubmit)}
              disabled={sending} 
              style={!errorsSend.descripcion ? { marginTop: theme.spacing.md } : {}} 
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