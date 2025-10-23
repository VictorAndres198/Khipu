import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// 1. Hooks de la App
import useSafeArea from '../../../src/hooks/useSafeArea';
import { useGlobalStyles } from '../../../src/hooks/useGlobalStyles'; // 👈 Dinámico
import useTheme from '../../../src/hooks/useTheme'; // 👈 Dinámico

// 2. Firebase
import { getCurrentUser } from '../../../src/services/firebase/auth';
import { 
  getUser, 
  getUserTransactions, 
  listenToUser, 
  listenToUserTransactions 
} from '../../../src/services/firebase/firestore';

// 3. Helpers (limpios y fuera del componente)
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = startOfToday.getTime() - startOfDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays > 1 && diffDays <= 6) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  } catch (error) {
    return 'Fecha inválida';
  }
};

const getTransactionIcon = (type) => {
  switch (type) {
    case 'envio': return 'arrow-top-right';
    case 'recepcion': return 'arrow-bottom-left';
    case 'recarga': return 'wallet-plus-outline';
    default: return 'credit-card-outline';
  }
};

export default function Home() {
  const { safeAreaInsets } = useSafeArea(false);
  const router = useRouter();
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme();
  
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 4. Lógica de Datos (Listeners)
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const unsubscribeUser = listenToUser(user.uid, (userData) => {
      setUserData(userData);
      setLoading(false);
    });
    const unsubscribeTransactions = listenToUserTransactions(user.uid, (allTransactions) => {
      setTransactions(allTransactions.slice(0, 3)); // Mantenemos las 3 más recientes para el feed
    });
    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, []);

  // 5. Carga manual para "Pull to Refresh"
  const loadUserDataManually = async (userId) => {
    try {
      const [userData, allTransactions] = await Promise.all([
        getUser(userId),
        getUserTransactions(userId)
      ]);
      setUserData(userData);
      setTransactions(allTransactions.slice(0, 3));
    } catch (error) {
      console.error('Error recargando datos:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron recargar los datos' });
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const user = getCurrentUser();
    if (user) {
      await loadUserDataManually(user.uid);
    }
    setRefreshing(false);
  }, []);

  // 6. Helper de Monto (depende del theme)
  const formatAmount = (transaction) => {
    if (!transaction) return { text: 'S/ 0.00', color: theme.colors.textSecondary };
    const amount = transaction.monto || 0;
    const isPositive = amount > 0;
    const sign = isPositive ? '+' : '';
    const color = isPositive ? theme.colors.success : theme.colors.text;
    return { text: `${sign}S/ ${Math.abs(amount).toFixed(2)}`, color };
  };

  // 7. Estilos locales dinámicos
  const localStyles = useMemo(() => StyleSheet.create({
    loadingText: {
      ...globalStyles.body,
      marginTop: theme.spacing.md,
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
    // Balance Card
    balanceCard: {
      ...globalStyles.card,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
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
    // Contenedor de sección
    sectionContainer: {
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      ...globalStyles.subtitle,
    },
    // Acciones Rápidas (NUEVO DISEÑO)
    quickActionsContainer: {
      flexDirection: 'row', 
      gap: theme.spacing.md,
    },
    quickActionButton: {
      ...globalStyles.button, 
      ...globalStyles.buttonSecondary, // Fondo gris claro
      flex: 1, // Para que ocupen 50%
      flexDirection: 'column', // Ícono arriba, texto abajo
      height: 90, // Más altos
      gap: theme.spacing.xs,
    },
    quickActionButtonText: {
      ...globalStyles.buttonTextSecondary,
      fontFamily: theme.typography.fontFamily.medium,
    },
    // Transacciones
    transactionListContainer: {
      ...globalStyles.card,
      paddingVertical: theme.spacing.xs,
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    transactionItemLast: {
      borderBottomWidth: 0,
    },
    transactionIconContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.round,
      padding: theme.spacing.sm,
      marginRight: theme.spacing.sm,
    },
    transactionDetails: {
      flex: 1,
    },
    transactionDescription: {
      ...globalStyles.body,
      fontFamily: theme.typography.fontFamily.medium,
    },
    transactionDate: {
      ...globalStyles.caption,
      marginTop: 2,
    },
    transactionAmount: {
      ...globalStyles.body,
      fontFamily: theme.typography.fontFamily.medium,
    },
    transactionListEmpty: {
      ...globalStyles.card,
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    transactionSeeAllButton: {
      paddingTop: theme.spacing.md,
      alignItems: 'center',
    },
    transactionSeeAllText: {
      ...globalStyles.body,
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.medium,
    },
  }), [globalStyles, theme]);

  // --- Estado de Carga ---
  if (loading && !userData) {
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
          Cargando...
        </Text>
      </View>
    );
  }

  // --- Pantalla Principal ---
  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      <ScrollView 
        contentContainerStyle={localStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header con saludo */}
        <View style={localStyles.headerContainer}>
          <Text style={globalStyles.title}>
            Hola, {userData?.nombre?.split(' ')[0] || 'Usuario'}
          </Text>
          <Text style={localStyles.headerSubtitle}>
            Bienvenido de vuelta a tu billetera
          </Text>
        </View>
        
        {/* Balance Card con Gradiente */}
        <LinearGradient
          colors={[theme.colors.primaryLight, theme.colors.primary]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={localStyles.balanceCard}
        >
          <Text style={localStyles.balanceLabel}>Balance Actual</Text>
          <Text style={localStyles.balanceAmount}>
            S/ {userData?.saldo?.toFixed(2) || '0.00'}
          </Text>
        </LinearGradient>

        {/* Acciones Rápidas (NUEVO DISEÑO) */}
        <View style={localStyles.sectionContainer}>
          <View style={localStyles.quickActionsContainer}>
            <TouchableOpacity 
              style={localStyles.quickActionButton}
              onPress={() => router.push('/(app)/send-money')}
            >
              <MaterialCommunityIcons name="arrow-top-right-bold-outline" size={24} color={theme.colors.onSecondary} />
              <Text style={localStyles.quickActionButtonText}>Enviar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={localStyles.quickActionButton}
              onPress={() => Alert.alert('Próximamente', 'Funcionalidad de solicitud en desarrollo')}
            >
              <MaterialCommunityIcons name="arrow-bottom-left-bold-outline" size={24} color={theme.colors.onSecondary} />
              <Text style={localStyles.quickActionButtonText}>Solicitar</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Actividad Reciente */}
        <View style={localStyles.sectionContainer}>
          <View style={localStyles.sectionHeader}>
            <Text style={localStyles.sectionTitle}>Actividad Reciente</Text>
            {transactions.length > 0 && (
              <Text style={globalStyles.caption}>
                {transactions.length} más recientes
              </Text>
            )}
          </View>
          
          {transactions.length === 0 ? (
            <View style={localStyles.transactionListEmpty}>
              <MaterialCommunityIcons name="format-list-bulleted" size={32} color={theme.colors.textSecondary} />
              <Text style={[globalStyles.body, { marginTop: theme.spacing.sm }]}>
                Aún no tienes transacciones
              </Text>
            </View>
          ) : (
            <View style={localStyles.transactionListContainer}>
              {transactions.map((transaction, index) => {
                const amountInfo = formatAmount(transaction);
                const isLast = index === transactions.length - 1;
                return (
                  <View 
                    key={transaction.id || index}
                    style={[
                      localStyles.transactionItem,
                      isLast && localStyles.transactionItemLast
                    ]}
                  >
                    <View style={localStyles.transactionIconContainer}>
                      <MaterialCommunityIcons 
                        name={getTransactionIcon(transaction.tipo)} 
                        size={20} 
                        color={theme.colors.text} 
                      />
                    </View>
                    
                    <View style={localStyles.transactionDetails}>
                      <Text style={localStyles.transactionDescription}>
                        {transaction.descripcion || 'Transacción'}
                      </Text>
                      <Text style={localStyles.transactionDate}>
                        {formatDate(transaction.fecha)}
                      </Text>
                    </View>
                    
                    <Text style={[localStyles.transactionAmount, { color: amountInfo.color }]}>
                      {amountInfo.text}
                    </Text>
                  </View>
                );
              })}
              
              <TouchableOpacity 
                style={localStyles.transactionSeeAllButton}
                onPress={() => router.push('/(app)/transactions')}
              >
                <Text style={localStyles.transactionSeeAllText}>
                  Ver toda la actividad
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}