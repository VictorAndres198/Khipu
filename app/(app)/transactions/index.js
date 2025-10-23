import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import useSafeArea from '../../../src/hooks/useSafeArea';
import { globalStyles } from '../../../src/styles/GlobalStyles';
import { getCurrentUser } from '../../../src/services/firebase/auth';
import { getUserTransactions, listenToUserTransactions } from '../../../src/services/firebase/firestore';

export default function TransactionsList() {
  const { safeAreaInsets } = useSafeArea(true);
  const router = useRouter();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // ✅ LISTENER EN TIEMPO REAL para transacciones
    const unsubscribe = listenToUserTransactions(user.uid, (allTransactions) => {
      setTransactions(allTransactions);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  });

  const handleRefresh = () => {
    setRefreshing(true);
    // Los listeners de Firestore se encargan de la actualización automática
  };

  const handleTransactionPress = (transaction) => {
    router.push(`/transactions/${transaction.id}`);
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para formatear monto con color
  const formatAmount = (transaction) => {
    if (!transaction) return { text: 'S/ 0.00', color: '#6C757D' };
    
    const amount = transaction.monto || 0;
    const isPositive = amount > 0;
    const sign = isPositive ? '+' : '';
    const color = isPositive ? '#4CAF50' : '#F44336';
    
    return { text: `${sign}S/ ${Math.abs(amount).toFixed(2)}`, color };
  };

  // Función para obtener ícono según tipo de transacción
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'envio': return '📤';
      case 'recepcion': return '📥';
      case 'recarga': return '💰';
      default: return '💳';
    }
  };

  // Función para obtener texto del tipo de transacción
  const getTransactionTypeText = (type) => {
    switch (type) {
      case 'envio': return 'Envío';
      case 'recepcion': return 'Recepción';
      case 'recarga': return 'Recarga';
      default: return 'Transacción';
    }
  };

  const renderTransactionItem = ({ item }) => {
    const amountInfo = formatAmount(item);
    const date = formatDate(item.fecha);
    
    return (
      <TouchableOpacity 
        style={[
          globalStyles.card, 
          { 
            marginBottom: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        ]}
        onPress={() => handleTransactionPress(item)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 20, marginRight: 12 }}>
            {getTransactionIcon(item.tipo)}
          </Text>
          
          <View style={{ flex: 1 }}>
            <Text style={globalStyles.body}>{item.descripcion || 'Transacción'}</Text>
            <Text style={[globalStyles.caption, { marginTop: 2 }]}>
              {date} • {getTransactionTypeText(item.tipo)}
            </Text>
          </View>
        </View>
        
        <Text style={[
          globalStyles.body,
          { 
            fontWeight: 'bold',
            color: amountInfo.color 
          }
        ]}>
          {amountInfo.text}
        </Text>
      </TouchableOpacity>
    );
  };

  // Estado de carga
  if (loading) {
    return (
      <View style={[globalStyles.container, safeAreaInsets, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text style={[globalStyles.body, { marginTop: 16 }]}>Cargando transacciones...</Text>
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      {/* Header Fijo */}
      <View style={{
        paddingTop: 24,
        paddingBottom: 16,
        paddingHorizontal: 16,
      }}>
        <Text style={globalStyles.title}>Historial de Transacciones</Text>
        <Text style={[globalStyles.caption, { marginTop: 4 }]}>
          {transactions.length} {transactions.length === 1 ? 'transacción' : 'transacciones'}
        </Text>
      </View>
      
      {/* Lista con padding */}
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={renderTransactionItem}
        style={globalStyles.containerWithPadding}
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Text style={[globalStyles.body, { textAlign: 'center' }]}>
              Aún no tienes transacciones
            </Text>
            <Text style={[globalStyles.caption, { textAlign: 'center', marginTop: 8 }]}>
              Realiza tu primera recarga o transferencia
            </Text>
          </View>
        }
      />
      
      {/* Footer Fijo */}
      <View style={globalStyles.footerContainer}>
        <TouchableOpacity 
          style={[globalStyles.button, globalStyles.buttonPrimary]}
          onPress={() => router.back()}
        >
          <Text style={globalStyles.buttonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}