// app/(app)/sendMoneyCentral.js
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Toast from 'react-native-toast-message';

// Hooks de la App
import useSafeArea from '../../src/hooks/useSafeArea';
import { useGlobalStyles } from '../../src/hooks/useGlobalStyles';
import useTheme from '../../src/hooks/useTheme';
import { getCurrentUser } from '../../src/services/firebase/auth'; // Para el 'fromIdentifier'
import { listenToUser, updateUserBalance, createTransaction, sendMoney } from '../../src/services/firebase/firestore'; // Para obtener 'userIdentifier'

// API Central
import { findWalletsByIdentifier, transferMoneyCentral } from '../../src/services/Api/centralApi';

// --- Esquemas de Validación ---

// 1. Esquema para el primer paso (Buscar)
const searchSchema = yup.object().shape({
  identifier: yup
    .string()
    .matches(/^[0-9]+$/, 'Solo números')
    .min(9, 'Debe ser un teléfono (9) o DNI (8) válido')
    .required('El identificador es requerido'),
});

// 2. Esquema para el segundo paso (Enviar)
const sendSchema = yup.object().shape({
  monto: yup
    .number()
    .typeError('Debe ser un monto válido')
    .positive('El monto debe ser positivo')
    .required('El monto es requerido'),
  // (Aquí podrías añadir validación de saldo si la API Central lo proveyera)
});

// --- Componente ---
export default function SendMoneyCentral() {
  const { safeAreaInsets } = useSafeArea(true); // 'true' para padding inferior
  const router = useRouter();
  const params = useLocalSearchParams(); // Para recibir el QR
  
  // Hooks de estilo y estado
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme(); // Renombramos 'theme' para evitar conflicto con 'localStyles'
  const [loading, setLoading] = useState(false); // Para Carga/Envío
  const [currentUserData, setCurrentUserData] = useState(null); // Para saber el 'fromIdentifier'

  // --- Estados del "Wizard" (Asistente) ---
  // 1. Lista de billeteras encontradas tras la búsqueda
  const [foundWallets, setFoundWallets] = useState([]);
  // 2. La billetera que el usuario seleccionó
  const [selectedWallet, setSelectedWallet] = useState(null); 
  // 3. El identificador que se buscó
  const [searchedIdentifier, setSearchedIdentifier] = useState('');

  // Cargar datos del usuario actual (para 'fromIdentifier')
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const unsub = listenToUser(user.uid, (data) => {
        setCurrentUserData(data);
      });
      return () => unsub();
    }
  }, []);

  // --- Hooks de Formulario ---
  
  // Formulario 1: Búsqueda
  const { 
    control: controlSearch, 
    handleSubmit: handleSubmitSearch, 
    formState: { errors: errorsSearch },
    setValue: setValueSearch // ✅ AÑADE ESTO
  } = useForm({
    resolver: yupResolver(searchSchema),
    mode: 'onBlur',
    defaultValues: {
      identifier: params.identifier || '' // 👈 Modifica esto (ya lo tenías)
    }
  });

  // Formulario 2: Envío
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

  useEffect(() => {
    // Lee el parámetro de la URL (del scanner)
    const scannedId = params.scannedIdentifier; 
    
    if (scannedId && typeof scannedId === 'string') {
      console.log(`[QR Scan] Identificador recibido: ${scannedId}`);
      
      // 1. Pone el número del QR en el campo de texto (para la UI)
      // (Usa 'identifier' porque así se llama en tu searchSchema)
      setValueSearch('identifier', scannedId, { shouldValidate: true });
      
      // 2. Ejecuta la búsqueda automáticamente
      // (onSearchSubmit espera un objeto { identifier: '...' })
      onSearchSubmit({ identifier: scannedId });
    }
  }, [params.scannedIdentifier, setValueSearch]); // Se ejecuta si el parámetro cambia

  // --- Lógica de la Pantalla ---

  // 1. Lógica de Búsqueda
  const onSearchSubmit = async (data) => {
    setLoading(true);
    setSelectedWallet(null); // Resetea la selección
    setSearchedIdentifier(data.identifier); // Guarda el ID buscado

    try {
      const response = await findWalletsByIdentifier(data.identifier);
      
      // ✅ LÓGICA SIMPLIFICADA (SIN FILTRO)
      if (response.found && response.wallets_disponibles.length > 0) {
        // Ahora pasamos TODAS las billeteras (Khipu, GrupoB, etc.)
        setFoundWallets(response.wallets_disponibles);
      } else {
        setFoundWallets([]);
        // Mensaje genérico
        Toast.show({ type: 'error', text1: 'No Encontrado', text2: 'No se encontraron billeteras para ese número.' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error de Red', text2: e.message });
    } finally {
      setLoading(false);
    }
  };

  // 2. Lógica de Selección
  const onSelectWallet = (wallet) => {
    setSelectedWallet(wallet);// (ej. { appName: 'BilleteraGrupoB', ... })
  };

  const onSendSubmit = async (data) => {
    // 'data' es { monto, descripcion }
    
    // --- Verificaciones Iniciales ---
    if (!selectedWallet || !currentUserData?.telefono || currentUserData?.saldo === undefined) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Faltan datos del remitente o destinatario.' });
      return;
    }
    
    const monto = data.monto;
    const miSaldoActual = currentUserData.saldo;
    const miUserId = getCurrentUser().uid;

    // Verificación de saldo local
    if (miSaldoActual < monto) {
      Toast.show({ type: 'error', text1: 'Saldo Insuficiente', text2: `Tu saldo actual en Khipu es S/ ${miSaldoActual.toFixed(2)}` });
      return;
    }

    setLoading(true);
    
    try {
      
      // ---------------------------------------------
      // --- ✅ INICIA LÓGICA DE ENVÍO INTELIGENTE ---
      // ---------------------------------------------
      
      // CASO A: El usuario seleccionó "Khipu"
      if (selectedWallet.app_name === 'Khipu') {
        
        console.log("[Envío Interno] Llamando a 'sendMoney' de Firebase...");

        // Llamamos a la función de 'firestore.js' que ya tenías
        // (Asume que 'sendMoney' maneja las 2 actualizaciones de saldo y crea las 2 transacciones en Firebase)
        await sendMoney(
          miUserId,
          searchedIdentifier, // El número de teléfono destino (que es de Khipu)
          monto,
          data.descripcion || 'Transferencia Khipu'
        );
        
        Toast.show({
          type: 'success',
          text1: 'Transferencia Exitosa (Khipu)',
          text2: `Enviaste S/ ${monto.toFixed(2)} a ${selectedWallet.user_name}`
        });

      } else {
        
        // --- CASO B: El usuario seleccionó "BilleteraGrupoB" (u otra) ---
        console.log("[Envío Externo] Llamando a API Central (Render)...");

        // 1. Llamar al API Central (Render)
        const transferData = {
          fromIdentifier: currentUserData.telefono,
          toIdentifier: searchedIdentifier,
          toAppName: selectedWallet.app_name, 
          monto: monto,
          descripcion: data.descripcion || "Transferencia Khipu"
        };
        const response = await transferMoneyCentral(transferData);

        if (!response.success || response.status !== 'COMPLETED') {
          throw new Error(response.message || 'La transferencia fue rechazada por el Hub.');
        }

        // 2. Actualizar Saldo Local (Firebase)
        const nuevoSaldoLocal = miSaldoActual - monto;
        await updateUserBalance(miUserId, nuevoSaldoLocal); 

        // 3. Registrar Transacción Local (Firestore)
        await createTransaction({
          usuarioId: miUserId,
          tipo: 'envio',
          monto: -monto,
          descripcion: data.descripcion || `Envío a ${selectedWallet.app_name}`,
          destinatarioNombre: selectedWallet.user_name,
          destinatarioApp: selectedWallet.app_name,
          centralTransactionId: response.centralTransactionId
        });
        
        Toast.show({
          type: 'success',
          text1: 'Transferencia Externa Exitosa',
          text2: `Enviaste S/ ${monto.toFixed(2)} a ${selectedWallet.user_name}`
        });
      }
      
      // -------------------------------------------
      // --- ✅ FIN DE LA LÓGICA INTELIGENTE ---
      // -------------------------------------------
      
      router.back(); // Cierra el modal en cualquier caso de éxito

    } catch (e) {
      console.error("Error en onSendSubmit:", e);
      Toast.show({ type: 'error', text1: 'Error al Enviar', text2: e.message });
    } finally {
      setLoading(false);
    }
  };

  // --- Estilos ---
  const localStyles = useMemo(() => StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      padding: theme.spacing.md,
    },
    headerContainer: {
      paddingBottom: theme.spacing.lg,
    },
    headerSubtitle: {
      ...globalStyles.body,
      marginTop: theme.spacing.sm,
      color: theme.colors.textSecondary,
    },
    sectionCard: {
      ...globalStyles.card,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...globalStyles.subtitle,
      marginBottom: theme.spacing.md,
    },
    // (Estilos de Inputs copiados de Login/Register)
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
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
    errorText: {
      color: theme.colors.error,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.sm,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    passwordToggleIcon: { 
      padding: theme.spacing.sm,
      marginRight: theme.spacing.xs,
      color: theme.colors.textSecondary,
    },
    gradientButton: {
      ...globalStyles.button,
    },
    // (Estilos para la Lista de Billeteras Encontradas)
    walletListContainer: {
      marginTop: theme.spacing.md,
    },
    walletButton: {
      ...globalStyles.button,
      ...globalStyles.buttonSecondary,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    walletButtonText: {
      ...globalStyles.buttonTextSecondary,
      fontSize: theme.typography.fontSize.lg,
    },
    // (Estilos para la pantalla de Monto)
    selectedWalletCard: {
      ...globalStyles.card,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.primary, // Color primario
      marginBottom: theme.spacing.md,
    },
    selectedWalletText: {
      ...globalStyles.subtitle,
      color: theme.colors.onPrimary,
    },
    selectedWalletSubtext: {
      ...globalStyles.caption,
      color: theme.colors.onPrimary,
      opacity: 0.8,
    }
  }), [globalStyles, theme]);
  
  // --- Renderizado ---
  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      <ScrollView 
        contentContainerStyle={localStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={localStyles.headerContainer}>
          <Text style={globalStyles.title}>Enviar a Otras Billeteras</Text>
          <Text style={localStyles.headerSubtitle}>
            Transfiere dinero a usuarios de otras apps.
          </Text>
        </View>

        {/* --- ESTADO 1 y 2: BUSCAR Y SELECCIONAR --- */}
        {/* (Este formulario solo se muestra si AÚN NO has seleccionado una billetera) */}
        {!selectedWallet && (
          <View style={localStyles.sectionCard}>
            <Text style={localStyles.sectionTitle}>1. Buscar Destinatario</Text>
            
            {/* Formulario de Búsqueda */}
            <View style={localStyles.inputWrapper}>
              <MaterialCommunityIcons name="magnify" size={20} style={localStyles.inputIcon} />
              <Controller
                control={controlSearch}
                name="identifier"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={localStyles.inputField}
                    placeholder="Teléfono o DNI del destinatario"
                    placeholderTextColor={theme.colors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="phone-pad"
                    editable={!loading}
                  />                  
                )}
              />
              <TouchableOpacity onPress={() => router.push('/(app)/scanner')}>
                <MaterialCommunityIcons 
                  name="qrcode-scan" 
                  size={22} 
                  style={localStyles.passwordToggleIcon} // Usa el estilo que añadimos
                />
              </TouchableOpacity>
            </View>
            {errorsSearch.identifier && (
              <Text style={localStyles.errorText}>{errorsSearch.identifier.message}</Text>
            )}

            <TouchableOpacity 
              onPress={handleSubmitSearch(onSearchSubmit)}
              disabled={loading}
              style={!errorsSearch.identifier ? { marginTop: theme.spacing.md } : {}}
            >
              <LinearGradient
                colors={[theme.colors.primaryLight, theme.colors.primary]}
                style={[localStyles.gradientButton, loading && globalStyles.buttonDisabled]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                ) : (
                  <Text style={globalStyles.buttonText}>Buscar</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Lista de Resultados */}
            {foundWallets.length > 0 && (
              <View style={localStyles.walletListContainer}>
                <Text style={[globalStyles.caption, { marginBottom: theme.spacing.sm }]}>
                  Encontramos {foundWallets.length} billetera(s) para "{searchedIdentifier}":
                </Text>
                    {foundWallets.map((item) => (
                    <TouchableOpacity
                        key={item.wallet_uuid}
                        style={localStyles.walletButton}
                        onPress={() => onSelectWallet(item)}
                    >
                        <Text style={localStyles.walletButtonText}>{item.app_name}</Text>
                        <Text style={globalStyles.caption}>{item.user_name}</Text>
                    </TouchableOpacity>
                    ))}
              </View>
            )}
          </View>
        )}

        {/* --- ESTADO 3: ENVIAR DINERO --- */}
        {/* (Este formulario solo se muestra SI YA seleccionaste una billetera) */}
        {selectedWallet && (
          <View style={localStyles.sectionCard}>
            <Text style={localStyles.sectionTitle}>2. Enviar a</Text>
            
            {/* Tarjeta de Destinatario */}
            <View style={localStyles.selectedWalletCard}>
              <MaterialCommunityIcons name="check-decagram" size={32} color={theme.colors.onPrimary} />
              <View style={{ flex: 1 }}>
                <Text style={localStyles.selectedWalletText}>{selectedWallet.user_name}</Text>
                <Text style={localStyles.selectedWalletSubtext}>{selectedWallet.app_name}</Text>
              </View>
              {/* Botón para cambiar (resetea el estado) */}
              <TouchableOpacity onPress={() => {
                setSelectedWallet(null);
                setFoundWallets([]);
              }}>
                <MaterialCommunityIcons name="close-circle" size={24} color={theme.colors.onPrimary} />
              </TouchableOpacity>
            </View>

            {/* Formulario de Monto */}
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
                    editable={!loading}
                  />
                )}
              />
            </View> 
            {errorsSend.monto && (
              <Text style={localStyles.errorText}>{errorsSend.monto.message}</Text>
            )}

            {/* Botón de Envío */}
            <TouchableOpacity 
              onPress={handleSubmitSend(onSendSubmit)}
              disabled={loading}
              style={!errorsSend.monto ? { marginTop: theme.spacing.md } : {}}
            >
              <LinearGradient
                colors={[theme.colors.primaryLight, theme.colors.primary]}
                style={[localStyles.gradientButton, loading && globalStyles.buttonDisabled]}
              >
                {loading ? (
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