import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  RefreshControl  // ✅ Este import está bien
} from 'react-native';
import { useRouter } from 'expo-router';
import useSafeArea from '../../../src/hooks/useSafeArea';
import { globalStyles } from '../../../src/styles/GlobalStyles';
import { getCurrentUser } from '../../../src/services/firebase/auth';
import { getUser, getUserTransactions, rechargeBalance, listenToUser, listenToUserTransactions } from '../../../src/services/firebase/firestore';

export default function Home() {
  const { safeAreaInsets } = useSafeArea(false);
  const router = useRouter();
  
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ✅ AGREGAR este estado

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // ✅ LISTENER EN TIEMPO REAL para datos del usuario
    const unsubscribeUser = listenToUser(user.uid, (userData) => {
      setUserData(userData);
      setLoading(false);
      setRefreshing(false);
    });

    // ✅ LISTENER EN TIEMPO REAL para transacciones
    const unsubscribeTransactions = listenToUserTransactions(user.uid, (allTransactions) => {
      setTransactions(allTransactions.slice(0, 3));
    });

    // Limpiar listeners al desmontar
    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    // Recargar datos manualmente
    const user = getCurrentUser();
    if (user) {
      loadUserData(user.uid);
    }
  };

  const loadUserData = async (userId) => {
    try {
      const userData = await getUser(userId);
      setUserData(userData);
      
      const allTransactions = await getUserTransactions(userId);
      setTransactions(allTransactions.slice(0, 3));
    } catch (error) {
      console.error('Error recargando datos:', error);
      Alert.alert('Error', 'No se pudieron recargar los datos');
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickRecharge = async (amount) => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      await rechargeBalance(user.uid, amount);
      Alert.alert('✅ Recarga exitosa', `Se recargó S/ ${amount} a tu cuenta`);
      // No necesitas recargar manualmente porque los listeners lo harán automáticamente
    } catch (error) {
      Alert.alert('❌ Error', error.message);
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Hoy';
      if (diffDays === 2) return 'Ayer';
      if (diffDays <= 7) return `Hace ${diffDays - 1} días`;
      
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
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

  // Estado de carga
  if (loading && !userData) {
    return (
      <View style={[globalStyles.container, safeAreaInsets, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text style={[globalStyles.body, { marginTop: 16 }]}>Cargando...</Text>
      </View>
    );
  }

  const user = getCurrentUser();

  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      <ScrollView 
        style={globalStyles.containerWithPadding}
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2E86AB']}
            tintColor="#2E86AB"
          />
        }
      >
        {/* Header con saludo personalizado */}
        <View style={globalStyles.headerContainerNoPadding}>
          <Text style={globalStyles.title}>
            Hola, {userData?.nombre?.split(' ')[0] || 'Usuario'} 👋
          </Text>
          <Text style={[globalStyles.body, { marginTop: 8 }]}>
            Bienvenido de vuelta a tu billetera
          </Text>
        </View>
        
        {/* Balance Card con datos reales */}
        <View style={[globalStyles.card, { marginBottom: 24 }]}>
          <Text style={globalStyles.subtitle}>Balance Actual</Text>
          <Text style={[
            globalStyles.title, 
            { 
              color: '#2E86AB', 
              marginTop: 8,
              fontSize: 32
            }
          ]}>
            S/ {userData?.saldo?.toFixed(2) || '0.00'}
          </Text>
          <Text style={[globalStyles.caption, { marginTop: 4 }]}>
            Saldo disponible
          </Text>
        </View>

        {/* Recarga Rápida */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
            Recarga Rápida
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: 8,
            justifyContent: 'space-between',
          }}>
            {[20, 50, 100, 200].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  globalStyles.button, 
                  globalStyles.buttonSecondary,
                  { 
                    width: '48%',
                    minWidth: '45%',
                  }
                ]}
                onPress={() => handleQuickRecharge(amount)}
              >
                <Text style={globalStyles.buttonTextSecondary}>+ S/ {amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Acciones Rápidas */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
            Acciones Rápidas
          </Text>
          
          <View style={{ gap: 12 }}>
            <TouchableOpacity 
              style={[globalStyles.button, globalStyles.buttonPrimary]}
              onPress={() => router.push('/(app)/transactions')}
            >
              <Text style={globalStyles.buttonText}>📊 Ver Historial Completo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[globalStyles.button, globalStyles.buttonSecondary]}
              onPress={() => router.push('/(app)/send-money')}
            >
              <Text style={globalStyles.buttonTextSecondary}>📤 Enviar Dinero</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[globalStyles.button, globalStyles.buttonSecondary]}
              onPress={() => Alert.alert('Próximamente', 'Funcionalidad de solicitud en desarrollo')}
            >
              <Text style={globalStyles.buttonTextSecondary}>👥 Solicitar Dinero</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Últimas Transacciones con datos reales */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16 
          }}>
            <Text style={globalStyles.subtitle}>Últimas Transacciones</Text>
            <Text style={globalStyles.caption}>
              {transactions.length} {transactions.length === 1 ? 'transacción' : 'transacciones'}
            </Text>
          </View>
          
          {transactions.length === 0 ? (
            <View style={[globalStyles.card, { alignItems: 'center', padding: 32 }]}>
              <Text style={[globalStyles.body, { textAlign: 'center' }]}>
                Aún no tienes transacciones
              </Text>
              <Text style={[globalStyles.caption, { textAlign: 'center', marginTop: 8 }]}>
                Realiza tu primera recarga o transacción
              </Text>
            </View>
          ) : (
            <View style={globalStyles.card}>
              {transactions.map((transaction, index) => {
                const amountInfo = formatAmount(transaction);
                return (
                  <View 
                    key={transaction.id || index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: index < transactions.length - 1 ? 1 : 0,
                      borderBottomColor: '#E9ECEF'
                    }}
                  >
                    <Text style={{ fontSize: 20, marginRight: 12 }}>
                      {getTransactionIcon(transaction.tipo)}
                    </Text>
                    
                    <View style={{ flex: 1 }}>
                      <Text style={globalStyles.body}>
                        {transaction.descripcion || 'Transacción'}
                      </Text>
                      <Text style={[globalStyles.caption, { marginTop: 2 }]}>
                        {formatDate(transaction.fecha)}
                      </Text>
                    </View>
                    
                    <Text style={[
                      globalStyles.body, 
                      { fontWeight: '600', color: amountInfo.color }
                    ]}>
                      {amountInfo.text}
                    </Text>
                  </View>
                );
              })}
              
              {transactions.length > 0 && (
                <TouchableOpacity 
                  style={{ 
                    paddingTop: 16, 
                    alignItems: 'center' 
                  }}
                  onPress={() => router.push('/(app)/transactions')}
                >
                  <Text style={[globalStyles.caption, { color: '#2E86AB' }]}>
                    Ver todas las transacciones
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Estadísticas Rápidas */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
            Resumen del Día
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-around',
            alignItems: 'center'
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={globalStyles.caption}>Transacciones</Text>
              <Text style={[globalStyles.body, { fontSize: 20, fontWeight: '600' }]}>
                {transactions.length}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={globalStyles.caption}>Ingresos Hoy</Text>
              <Text style={[globalStyles.body, { fontSize: 20, fontWeight: '600', color: '#4CAF50' }]}>
                S/ {transactions
                  .filter(t => t.monto > 0)
                  .reduce((sum, t) => sum + (t.monto || 0), 0)
                  .toFixed(2)}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={globalStyles.caption}>Gastos Hoy</Text>
              <Text style={[globalStyles.body, { fontSize: 20, fontWeight: '600', color: '#F44336' }]}>
                S/ {Math.abs(transactions
                  .filter(t => t.monto < 0)
                  .reduce((sum, t) => sum + (t.monto || 0), 0))
                  .toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}