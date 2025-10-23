import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import useSafeArea from '../../../src/hooks/useSafeArea';
import { globalStyles } from '../../../src/styles/GlobalStyles';
import { getCurrentUser } from '../../../src/services/firebase/auth';
import { getUser, rechargeBalance, listenToUser } from '../../../src/services/firebase/firestore';

export default function Wallet() {
  const { safeAreaInsets } = useSafeArea(false);
  const router = useRouter();
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rechargeLoading, setRechargeLoading] = useState(false); // ✅ AGREGAR este estado

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setLoading(true);
      try {
        // ✅ LISTENER EN TIEMPO REAL para datos del usuario
        const unsubscribeUser = listenToUser(user.uid, (userData) => {
          setUserData(userData);
          setLoading(false);
        });

        // Limpiar listener al desmontar
        return () => unsubscribeUser();
      } catch (error) {
        console.error('Error cargando datos:', error);
        Alert.alert('Error', 'No se pudo cargar la información del usuario');
        setLoading(false);
      }
    }
  }, []);

  const handleRecharge = async (amount) => {
    const user = getCurrentUser();
    if (!user) return;

    setRechargeLoading(true); // ✅ Usar el estado correcto
    try {
      await rechargeBalance(user.uid, amount);
      Alert.alert('✅ Recarga exitosa', `Se recargó S/ ${amount} a tu cuenta`);
      // No necesitas recargar manualmente porque el listener actualizará los datos
    } catch (error) {
      Alert.alert('❌ Error', error.message);
    } finally {
      setRechargeLoading(false); // ✅ Finalizar loading
    }
  };

  // Estados de carga
  if (loading && !userData) {
    return (
      <View style={[globalStyles.container, safeAreaInsets, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text style={[globalStyles.body, { marginTop: 16 }]}>Cargando billetera...</Text>
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      <ScrollView 
        style={globalStyles.containerWithPadding}
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={globalStyles.headerContainerNoPadding}>
          <Text style={globalStyles.title}>Mi Billetera</Text>
          <Text style={[globalStyles.body, { marginTop: 8 }]}>
            Gestiona tu dinero de forma segura
          </Text>
        </View>

        {/* Balance Principal */}
        <View style={[globalStyles.card, { marginBottom: 24 }]}>
          <Text style={globalStyles.subtitle}>Balance Total</Text>
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
          <Text style={[globalStyles.caption, { marginTop: 8 }]}>
            Saldo disponible
          </Text>
        </View>

        {/* Recarga Rápida */}
        <View style={[globalStyles.card, { marginBottom: 24 }]}>
          <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
            Recarga Rápida
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: 8,
            justifyContent: 'space-between'
          }}>
            {[10, 20, 50, 100, 200, 500].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  globalStyles.button, 
                  globalStyles.buttonSecondary,
                  { 
                    width: '48%', 
                    minWidth: '30%',
                    opacity: rechargeLoading ? 0.6 : 1 // ✅ Usar rechargeLoading
                  }
                ]}
                onPress={() => handleRecharge(amount)}
                disabled={rechargeLoading} // ✅ Deshabilitar durante la recarga
              >
                <Text style={globalStyles.buttonTextSecondary}>S/ {amount}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[globalStyles.caption, { marginTop: 16, textAlign: 'center' }]}>
            {rechargeLoading ? 'Procesando recarga...' : 'Selecciona un monto para recargar'}
          </Text>
        </View>

        {/* Acciones Rápidas */}
        <View style={[globalStyles.card, { marginBottom: 24 }]}>
          <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
            Acciones Rápidas
          </Text>
          
          <View style={{ gap: 12 }}>
            <TouchableOpacity 
              style={[globalStyles.button, globalStyles.buttonPrimary]}
              onPress={() => router.push('/(app)/transactions')}
            >
              <Text style={globalStyles.buttonText}>📊 Ver Historial</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[globalStyles.button, globalStyles.buttonSecondary]}
              onPress={() => router.push('/(app)/send-money')}
            >
              <Text style={globalStyles.buttonTextSecondary}>📤 Enviar Dinero</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[globalStyles.button, globalStyles.buttonSecondary]}
              onPress={() => Alert.alert('Próximamente', 'Funcionalidad de retiro en desarrollo')}
            >
              <Text style={globalStyles.buttonTextSecondary}>📥 Retirar Dinero</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Métodos de Pago */}
        <View style={[globalStyles.card, { marginBottom: 24 }]}>
          <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
            Métodos de Pago
          </Text>
          
          <View style={[globalStyles.card, { 
            backgroundColor: '#F8F9FA', 
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center'
          }]}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>💳</Text>
            <View style={{ flex: 1 }}>
              <Text style={globalStyles.body}>Tarjeta Principal</Text>
              <Text style={globalStyles.caption}>Visa •••• 1234</Text>
            </View>
            <Text style={[globalStyles.caption, { color: '#2E86AB' }]}>Principal</Text>
          </View>

          <TouchableOpacity 
            style={[globalStyles.button, globalStyles.buttonSecondary]}
            onPress={() => Alert.alert('Próximamente', 'Gestión de métodos de pago en desarrollo')}
          >
            <Text style={globalStyles.buttonTextSecondary}>+ Agregar método de pago</Text>
          </TouchableOpacity>
        </View>

        {/* Estadísticas del Mes */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
            Resumen del Mes
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={globalStyles.caption}>Ingresos</Text>
              <Text style={[globalStyles.body, { color: '#4CAF50', fontSize: 18 }]}>
                S/ {userData?.saldo ? (userData.saldo > 0 ? userData.saldo.toFixed(2) : '0.00') : '0.00'}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={globalStyles.caption}>Gastos</Text>
              <Text style={[globalStyles.body, { color: '#F44336', fontSize: 18 }]}>
                S/ 0.00
              </Text>
            </View>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={globalStyles.caption}>Total de transacciones</Text>
            <Text style={[globalStyles.body, { fontSize: 18 }]}>0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}