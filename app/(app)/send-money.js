import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// 1. Hooks de la App
import useSafeArea from '../../src/hooks/useSafeArea';
import { useGlobalStyles } from '../../src/hooks/useGlobalStyles'; // 👈 Dinámico
import useTheme from '../../src/hooks/useTheme'; // 👈 Dinámico

// 2. Firebase
import { getCurrentUser } from '../../src/services/firebase/auth';
import { findUserByPhone, sendMoney, listenToUser } from '../../src/services/firebase/firestore';

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

  // 5. Lógica (sin cambios)
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const unsubscribe = listenToUser(user.uid, setUserData);
      return unsubscribe;
    }
  }, []);

  const searchUser = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Ingresa un número de teléfono válido' });
      return;
    }
    setSearching(true);
    try {
      const user = await findUserByPhone(phoneNumber);
      setFoundUser(user);
      if (!user) {
        Toast.show({ type: 'error', text1: 'Usuario no encontrado', text2: 'Verifica el número de teléfono' });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo buscar el usuario');
    } finally {
      setSearching(false);
    }
  };

  const handleSendMoney = async () => {
    // ... (Tu lógica de validación y envío es perfecta, sin cambios)
    const user = getCurrentUser();
    if (!user || !foundUser) return;
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Ingresa un monto válido' });
      return;
    }
    if (userData?.saldo < numericAmount) {
      Toast.show({ type: 'error', text1: 'Saldo insuficiente', text2: `Tu saldo es S/ ${userData.saldo.toFixed(2)}` });
      return;
    }
    setSending(true);
    try {
      await sendMoney(
        user.uid, 
        phoneNumber, 
        numericAmount, 
        description || 'Transferencia'
      );
      Toast.show({
        type: 'success',
        text1: 'Transferencia Exitosa',
        text2: `Enviaste S/ ${numericAmount.toFixed(2)} a ${foundUser.nombre}`,
        onHide: () => router.back() // <-- Navega cuando el toast desaparece
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error de Transferencia', text2: error.message });
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
            <TextInput
              style={localStyles.inputField}
              placeholder="Número de teléfono"
              placeholderTextColor={theme.colors.textSecondary}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              editable={!searching && !sending}
            />
          </View>

          <TouchableOpacity 
            onPress={searchUser}
            disabled={searching || !phoneNumber}
          >
            <LinearGradient
              colors={[theme.colors.primaryLight, theme.colors.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[
                localStyles.gradientButton,
                (searching || !phoneNumber) && globalStyles.buttonDisabled
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
          <View style={localStyles.sectionCard}>
            <Text style={localStyles.sectionTitle}>
              2. Detalles de Transferencia
            </Text>
            
            <View style={localStyles.inputWrapper}>
              <MaterialCommunityIcons name="cash" size={20} style={localStyles.inputIcon} />
              <TextInput
                style={localStyles.inputField}
                placeholder="Monto (S/)"
                placeholderTextColor={theme.colors.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                editable={!sending}
              />
            </View>

            <View style={localStyles.inputWrapper}>
              <MaterialCommunityIcons name="text-short" size={20} style={localStyles.inputIcon} />
              <TextInput
                style={localStyles.inputField}
                placeholder="Descripción (opcional)"
                placeholderTextColor={theme.colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                editable={!sending}
              />
            </View>

            <TouchableOpacity 
              onPress={handleSendMoney}
              disabled={sending || !amount || parseFloat(amount) <= 0}
            >
              <LinearGradient
                colors={[theme.colors.primaryLight, theme.colors.primary]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[
                  localStyles.gradientButton,
                  (sending || !amount || parseFloat(amount) <= 0) && globalStyles.buttonDisabled
                ]}
              >
                {sending ? (
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                ) : (
                  <Text style={globalStyles.buttonText}>
                    Enviar S/ {amount || '0.00'}
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