import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// 1. Hooks de la App
import useSafeArea from '../../../src/hooks/useSafeArea';
import { useGlobalStyles } from '../../../src/hooks/useGlobalStyles'; // 👈 Dinámico
import useTheme from '../../../src/hooks/useTheme'; // 👈 Dinámico

// 2. Firebase
import { getCurrentUser } from '../../../src/services/firebase/auth';
import { getUserTransactions, listenToUserTransactions } from '../../../src/services/firebase/firestore';

// 3. Helpers (movidos fuera para limpieza)
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
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

const getTransactionTypeText = (type) => {
  switch (type) {
    case 'envio': return 'Envío';
    case 'recepcion': return 'Recepción';
    case 'recarga': return 'Recarga';
    default: return 'Transacción';
  }
};

// 4. Componente de Item Memoizado para optimizar FlatList
const TransactionItem = React.memo(({ item, onPress, formatAmount }) => {
  const { theme } = useTheme();
  const globalStyles = useGlobalStyles();
  
  // Estilos específicos del Item
  const itemStyles = useMemo(() => StyleSheet.create({
    container: {
      ...globalStyles.card,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.sm, // Un padding más ajustado para la lista
    },
    iconContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.round,
      padding: theme.spacing.sm,
      marginRight: theme.spacing.sm,
    },
    detailsContainer: {
      flex: 1,
    },
    description: {
      ...globalStyles.body,
      fontFamily: theme.typography.fontFamily.medium,
    },
    date: {
      ...globalStyles.caption,
      marginTop: 2,
    },
    amount: {
      ...globalStyles.body,
      fontFamily: theme.typography.fontFamily.medium,
      marginLeft: theme.spacing.sm,
    }
  }), [theme, globalStyles]);

  const amountInfo = formatAmount(item);
  const date = formatDate(item.fecha);

  return (
    <TouchableOpacity 
      style={itemStyles.container}
      onPress={() => onPress(item)}
    >
      <View style={itemStyles.iconContainer}>
        <MaterialCommunityIcons 
          name={getTransactionIcon(item.tipo)} 
          size={20} 
          color={theme.colors.text} 
        />
      </View>
      
      <View style={itemStyles.detailsContainer}>
        <Text style={itemStyles.description}>{item.descripcion || 'Transacción'}</Text>
        <Text style={itemStyles.date}>
          {date} • {getTransactionTypeText(item.tipo)}
        </Text>
      </View>
      
      <Text style={[itemStyles.amount, { color: amountInfo.color }]}>
        {amountInfo.text}
      </Text>
    </TouchableOpacity>
  );
});


// --- Componente Principal ---
export default function TransactionsList() {
  const { safeAreaInsets } = useSafeArea(true); // 👈 'true' para padding inferior
  const router = useRouter();
  
  // 5. Hooks de estilo y tema
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 6. Lógica de Datos (con refresh manual mejorado)
  useFocusEffect(
    useCallback(() => {
      const user = getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }
      // Listener para actualizaciones en tiempo real
      const unsubscribe = listenToUserTransactions(user.uid, (allTransactions) => {
        setTransactions(allTransactions);
        setLoading(false);
        // NO ponemos setRefreshing(false) aquí
      });
      return () => unsubscribe();
    }, [])
  );

  const loadTransactionsManually = async () => {
    const user = getCurrentUser();
    if (!user) return;
    try {
      const allTransactions = await getUserTransactions(user.uid);
      setTransactions(allTransactions);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron recargar las transacciones' });
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactionsManually();
    setRefreshing(false);
  }, []);

  const handleTransactionPress = (transaction) => {
    router.push(`/transactions/${transaction.id}`);
  };

  // 7. Helper de Monto (depende del theme)
  const formatAmount = useCallback((transaction) => {
    if (!transaction) return { text: 'S/ 0.00', color: theme.colors.textSecondary };
    const amount = transaction.monto || 0;
    const isPositive = amount > 0;
    const sign = isPositive ? '+' : '';
    // Usamos 'success' para positivo, 'text' (negro/blanco) para negativo
    const color = isPositive ? theme.colors.success : theme.colors.text;
    return { text: `${sign}S/ ${Math.abs(amount).toFixed(2)}`, color };
  }, [theme]); // Depende del tema

  // 8. Estilos locales dinámicos
  const localStyles = useMemo(() => StyleSheet.create({
    loadingText: {
      ...globalStyles.body,
      marginTop: theme.spacing.md,
      color: theme.colors.textSecondary,
    },
    // Header Fijo
    headerContainer: {
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerSubtitle: {
      ...globalStyles.caption,
      marginTop: theme.spacing.xs,
    },
    // Contenedor de la Lista
    listContentContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    // Footer Fijo
    footerContainer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      backgroundColor: theme.colors.background, // Para que no sea transparente
    },
    closeButton: {
      ...globalStyles.button,
    },
    // Lista Vacía
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxxl,
      gap: theme.spacing.md,
    },
    emptyText: {
      ...globalStyles.body,
      textAlign: 'center',
    },
  }), [globalStyles, theme]);

  // --- Estado de Carga ---
  if (loading) {
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
      {/* Header Fijo */}
      <View style={localStyles.headerContainer}>
        <Text style={globalStyles.title}>Historial de Transacciones</Text>
        <Text style={localStyles.headerSubtitle}>
          {transactions.length} {transactions.length === 1 ? 'transacción' : 'transacciones'}
        </Text>
      </View>
      
      {/* Lista */}
      <FlatList
        style={{ flex: 1 }} // 👈 Ocupa el espacio restante
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TransactionItem 
            item={item} 
            onPress={handleTransactionPress}
            formatAmount={formatAmount}
          />
        )}
        contentContainerStyle={localStyles.listContentContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={localStyles.emptyContainer}>
            <MaterialCommunityIcons name="format-list-bulleted" size={40} color={theme.colors.textSecondary} />
            <Text style={localStyles.emptyText}>
              Aún no tienes transacciones
            </Text>
          </View>
        }
      />
      
      {/* Footer Fijo */}
      <View style={localStyles.footerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <LinearGradient
            colors={[theme.colors.primaryLight, theme.colors.primary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={localStyles.closeButton}
          >
            <Text style={globalStyles.buttonText}>Cerrar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}