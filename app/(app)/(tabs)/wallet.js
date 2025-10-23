// screens/(app)/wallet.js (CORREGIDO)
import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message'; // Importar Toast

// 1. Hooks de la App
import useSafeArea from '../../../src/hooks/useSafeArea';
import { useGlobalStyles } from '../../../src/hooks/useGlobalStyles'; 
import useTheme from '../../../src/hooks/useTheme'; // 👈 Importa el hook

// 2. Firebase
import { getCurrentUser } from '../../../src/services/firebase/auth';
import { 
  rechargeBalance, 
  listenToUser, 
  listenToUserTransactions 
} from '../../../src/services/firebase/firestore';


export default function Wallet() {
  const { safeAreaInsets } = useSafeArea(false);
  const router = useRouter();
  
  // 3. Hooks de estilo y tema
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme(); // ✅ CORRECCIÓN 1: Destructurar el tema
  
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true); // Carga inicial
  const [rechargeLoading, setRechargeLoading] = useState(false); // Carga de recarga

  // 4. Lógica de datos (Listener)
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      let userDataLoaded = false;
      let transactionsLoaded = false;
      
      // Función para comprobar si ambos listeners han cargado
      const checkLoading = () => {
        if (userDataLoaded && transactionsLoaded) {
          setLoading(false);
        }
      };

      // Listener 1: Datos del usuario (saldo)
      const unsubscribeUser = listenToUser(user.uid, (userData) => {
        setUserData(userData);
        userDataLoaded = true;
        checkLoading();
      });
      
      // Listener 2: Lista de transacciones (para cálculos)
      const unsubscribeTransactions = listenToUserTransactions(user.uid, (allTransactions) => {
        setTransactions(allTransactions);
        transactionsLoaded = true;
        checkLoading();
      });

      // Limpieza al desmontar
      return () => {
        unsubscribeUser();
        unsubscribeTransactions();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();

    // 1. Filtramos transacciones del mes y año actual
    const currentMonthTransactions = transactions.filter(t => {
      if (!t.fecha) return false;
      const tDate = new Date(t.fecha);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });

    // 2. Calculamos ingresos (positivos)
    const ingresos = currentMonthTransactions
      .filter(t => t.monto > 0)
      .reduce((sum, t) => sum + (t.monto || 0), 0);

    // 3. Calculamos gastos (negativos)
    const gastos = currentMonthTransactions
      .filter(t => t.monto < 0)
      .reduce((sum, t) => sum + (t.monto || 0), 0);
    
    return {
      ingresos: ingresos.toFixed(2),
      gastos: Math.abs(gastos).toFixed(2) // Usamos Math.abs para mostrarlo positivo
    };
  }, [transactions]);

  // 5. Lógica de Recarga (con Toast)
  const handleRecharge = async (amount) => {
    const user = getCurrentUser();
    if (!user) return;

    setRechargeLoading(true);
    try {
      await rechargeBalance(user.uid, amount);
      Toast.show({ // 👈 Usar Toast
        type: 'success',
        text1: 'Recarga Exitosa',
        text2: `Se recargó S/ ${amount} a tu cuenta`
      });
    } catch (error) {
      Toast.show({ // 👈 Usar Toast
        type: 'error',
        text1: 'Error de Recarga',
        text2: error.message
      });
    } finally {
      setRechargeLoading(false);
    }
  };

  // 6. Estilos locales dinámicos
  const localStyles = useMemo(() => StyleSheet.create({
    loadingText: {
      ...globalStyles.body,
      marginTop: theme.spacing.md, // 👈 'theme' ahora está definido
      color: theme.colors.textSecondary,
    },
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
    // ... (El resto de tus localStyles)
    balanceCard: {
      ...globalStyles.card,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      overflow: 'hidden', 
    },
    balanceLabel: {
      ...globalStyles.body,
      color: theme.colors.onPrimary,
      opacity: 0.9,
    },
    balanceAmount: {
      ...globalStyles.title,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.onPrimary,
      fontSize: theme.typography.fontSize.xxxl,
      marginTop: theme.spacing.sm,
    },
    sectionCard: {
      ...globalStyles.card,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...globalStyles.subtitle,
      marginBottom: theme.spacing.md,
    },
    quickRechargeContainer: {
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      justifyContent: 'space-between',
    },
    quickRechargeButton: {
      ...globalStyles.button, 
      ...globalStyles.buttonSecondary,
      width: '48%', 
      marginBottom: theme.spacing.sm,
    },
    rechargeCaption: {
      ...globalStyles.caption,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
    quickActionsContainer: {
      gap: theme.spacing.sm,
    },
    quickActionButton: {
      ...globalStyles.button,
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    paymentMethodItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
    },
    paymentMethodDetails: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    paymentMethodTag: {
      ...globalStyles.caption,
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.medium,
    },
    statsContainer: {
      flexDirection: 'row', 
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      flex: 1,
    },
    statValue: {
      ...globalStyles.body,
      fontFamily: theme.typography.fontFamily.medium,
      fontSize: theme.typography.fontSize.lg,
    }
  }), [globalStyles, theme]);

  // --- Estado de Carga ---
  // (Este 'if' ahora usa los estilos dinámicos de 'localStyles')
  if (loading) { // 👈 El '!userData' no es necesario si 'loading' se gestiona bien
    return (
      <View style={[globalStyles.loadingContainer, safeAreaInsets]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={localStyles.loadingText}>Cargando billetera...</Text>
      </View>
    );
  }

  // --- Pantalla Principal ---
  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      {/* ... (El resto de tu JSX de <ScrollView> no cambia) ... */}
      <ScrollView 
        contentContainerStyle={localStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={localStyles.headerContainer}>
          <Text style={globalStyles.title}>Mi Billetera</Text>
          <Text style={localStyles.headerSubtitle}>
            Gestiona tu dinero de forma segura
          </Text>
        </View>

        {/* Balance Principal */}
        <LinearGradient
          colors={[theme.colors.primaryLight, theme.colors.primary]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={localStyles.balanceCard}
        >
          <Text style={localStyles.balanceLabel}>Balance Total</Text>
          <Text style={localStyles.balanceAmount}>
            S/ {userData?.saldo?.toFixed(2) || '0.00'}
          </Text>
        </LinearGradient>

        {/* Recarga Rápida */}
        <View style={localStyles.sectionCard}>
          <Text style={localStyles.sectionTitle}>Recarga Rápida</Text>
          <View style={localStyles.quickRechargeContainer}>
            {[10, 20, 50, 100, 200, 500].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  localStyles.quickRechargeButton,
                  rechargeLoading && globalStyles.buttonDisabled
                ]}
                onPress={() => handleRecharge(amount)}
                disabled={rechargeLoading}
              >
                <Text style={globalStyles.buttonTextSecondary}>S/ {amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={localStyles.rechargeCaption}>
            {rechargeLoading ? 'Procesando recarga...' : 'Selecciona un monto para recargar'}
          </Text>
        </View>

        {/* Acciones Rápidas */}
        <View style={localStyles.sectionCard}>
          <Text style={localStyles.sectionTitle}>Acciones Rápidas</Text>
          <View style={localStyles.quickActionsContainer}>
            <TouchableOpacity 
              style={[localStyles.quickActionButton, globalStyles.buttonSecondary]}
              onPress={() => router.push('/(app)/transactions')}
            >
              <MaterialCommunityIcons name="format-list-bulleted" size={18} color={theme.colors.onSecondary} />
              <Text style={globalStyles.buttonTextSecondary}>Ver Historial</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[localStyles.quickActionButton, globalStyles.buttonSecondary]}
              onPress={() => router.push('/(app)/send-money')}
            >
              <MaterialCommunityIcons name="arrow-top-right" size={18} color={theme.colors.onSecondary} />
              <Text style={globalStyles.buttonTextSecondary}>Enviar Dinero</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[localStyles.quickActionButton, globalStyles.buttonSecondary]}
              onPress={() => router.push('/(app)/my-qr')} // 👈 Acción
            >
              <MaterialCommunityIcons name="qrcode" size={18} color={theme.colors.onSecondary} />
              <Text style={globalStyles.buttonTextSecondary}>Recibir con QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Métodos de Pago */}
        <View style={localStyles.sectionCard}>
          <Text style={localStyles.sectionTitle}>Métodos de Pago</Text>
          <View style={localStyles.paymentMethodItem}>
            <MaterialCommunityIcons name="credit-card-outline" size={24} color={theme.colors.text} />
            <View style={localStyles.paymentMethodDetails}>
              <Text style={globalStyles.body}>Tarjeta Principal</Text>
              <Text style={globalStyles.caption}>Visa •••• 1234</Text>
            </View>
            <Text style={localStyles.paymentMethodTag}>Principal</Text>
          </View>
          <TouchableOpacity 
            style={[localStyles.quickActionButton, globalStyles.buttonSecondary, { marginTop: theme.spacing.sm }]}
            onPress={() => Toast.show({ type: 'error', text1: 'Próximamente', text2: 'Gestión de métodos de pago en desarrollo' })}
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={18} color={theme.colors.onSecondary} />
            <Text style={globalStyles.buttonTextSecondary}>Agregar método</Text>
          </TouchableOpacity>
        </View>
        
        {/* Estadísticas del Mes */}
        <View style={localStyles.sectionCard}>
          <Text style={localStyles.sectionTitle}>Resumen del Mes</Text>
          <View style={localStyles.statsContainer}>
            <View style={localStyles.statItem}>
              <Text style={globalStyles.caption}>Ingresos</Text>
              <Text style={[localStyles.statValue, { color: theme.colors.success }]}>
                S/ {monthlyStats.ingresos}
              </Text>
            </View>
            <View style={localStyles.statItem}>
              <Text style={globalStyles.caption}>Gastos</Text>
              <Text style={[localStyles.statValue, { color: theme.colors.error }]}>
                S/ {monthlyStats.gastos}
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}