import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useSafeArea from '../../../src/hooks/useSafeArea';
import { globalStyles } from '../../../src/styles/GlobalStyles';
import { getTransactionById, getUser } from '../../../src/services/firebase/firestore';

export default function TransactionDetail() {
  const { id } = useLocalSearchParams();
  const { safeAreaInsets } = useSafeArea(true);
  const router = useRouter();
  
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    const loadTransaction = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const transactionData = await getTransactionById(id);
        setTransaction(transactionData);

        // Cargar información del contacto si existe
        if (transactionData) {
          if (transactionData.tipo === 'envio' && transactionData.destinatario) {
            const recipient = await getUser(transactionData.destinatario);
            setContactInfo({
              type: 'destinatario',
              name: recipient?.nombre || 'Usuario',
              phone: recipient?.telefono || 'N/A'
            });
          } else if (transactionData.tipo === 'recepcion' && transactionData.remitente) {
            const sender = await getUser(transactionData.remitente);
            setContactInfo({
              type: 'remitente', 
              name: sender?.nombre || 'Usuario',
              phone: sender?.telefono || 'N/A'
            });
          }
        }
      } catch (error) {
        console.error('Error cargando transacción:', error);
        Alert.alert('Error', 'No se pudo cargar la transacción');
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [id]);

  // Función para obtener texto del tipo de transacción
  const getTransactionTypeText = (type) => {
    switch (type) {
      case 'envio': return 'Envío de dinero';
      case 'recepcion': return 'Recepción de dinero';
      case 'recarga': return 'Recarga de saldo';
      default: return 'Transacción';
    }
  };

  // Función para obtener texto del estado
  const getStatusText = (status) => {
    switch (status) {
      case 'completado': return 'Completado';
      case 'pendiente': return 'Pendiente';
      case 'fallido': return 'Fallido';
      default: return status || 'Completado';
    }
  };

  // Función para obtener color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'completado': return '#4CAF50';
      case 'pendiente': return '#FF9800';
      case 'fallido': return '#F44336';
      default: return '#4CAF50';
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <View style={[globalStyles.container, safeAreaInsets, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text style={[globalStyles.body, { marginTop: 16 }]}>Cargando transacción...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[globalStyles.container, safeAreaInsets, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={globalStyles.title}>Transacción no encontrada</Text>
        <Text style={[globalStyles.body, { marginTop: 8, textAlign: 'center' }]}>
          La transacción que buscas no existe o fue eliminada
        </Text>
        <TouchableOpacity 
          style={[globalStyles.button, globalStyles.buttonPrimary, { marginTop: 24 }]}
          onPress={() => router.back()}
        >
          <Text style={globalStyles.buttonText}>Volver al historial</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPositive = transaction.monto > 0;
  const date = transaction.fecha ? new Date(transaction.fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Fecha no disponible';

  const time = transaction.fecha ? new Date(transaction.fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Hora no disponible';

  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      {/* Header Fijo */}
      <View style={{ 
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 8,
      }}>
        <Text style={globalStyles.title}>Detalle de Transacción</Text>
      </View>
      
      {/* Contenido Scrollable */}
      <ScrollView 
        style={globalStyles.containerWithPadding}
        contentContainerStyle={[globalStyles.scrollContent, { paddingBottom: 48 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Monto */}
        <View style={[
          globalStyles.card, 
          { 
            alignItems: 'center', 
            backgroundColor: isPositive ? '#E8F5E8' : '#FFEBEE'
          }
        ]}>
          <Text style={[
            globalStyles.title,
            { 
              color: isPositive ? '#4CAF50' : '#F44336',
              fontSize: 32
            }
          ]}>
            {isPositive ? '+' : ''}S/ {Math.abs(transaction.monto).toFixed(2)}
          </Text>
          <Text style={[globalStyles.body, { marginTop: 8 }]}>
            {transaction.descripcion || getTransactionTypeText(transaction.tipo)}
          </Text>
          <Text style={[globalStyles.caption, { marginTop: 4, color: isPositive ? '#4CAF50' : '#F44336' }]}>
            {getTransactionTypeText(transaction.tipo)}
          </Text>
        </View>

        {/* Información del contacto (solo para transferencias) */}
        {(transaction.tipo === 'envio' || transaction.tipo === 'recepcion') && contactInfo && (
          <View style={[globalStyles.card, { marginTop: 16 }]}>
            <Text style={[globalStyles.subtitle, { marginBottom: 12 }]}>
              {contactInfo.type === 'destinatario' ? 'Destinatario' : 'Remitente'}
            </Text>
            
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
            }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>
                {contactInfo.type === 'destinatario' ? '👤' : '👤'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={globalStyles.body}>{contactInfo.name}</Text>
                <Text style={globalStyles.caption}>{contactInfo.phone}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Información detallada */}
        <View style={[globalStyles.card, { marginTop: 16 }]}>
          <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
            Información de la Transacción
          </Text>
          
          <DetailRow label="Fecha" value={date} />
          <DetailRow label="Hora" value={time} />
          <DetailRow label="Tipo" value={getTransactionTypeText(transaction.tipo)} />
          <DetailRow label="Categoría" value={transaction.categoria || 'General'} />
          <DetailRow 
            label="Estado" 
            value={getStatusText(transaction.estado)} 
            valueStyle={{ 
              color: getStatusColor(transaction.estado),
              fontWeight: 'bold'
            }}
          />
          <DetailRow label="ID de transacción" value={transaction.id} />
        </View>

        {/* Información adicional para recargas */}
        {transaction.tipo === 'recarga' && (
          <View style={[globalStyles.card, { marginTop: 16 }]}>
            <Text style={[globalStyles.subtitle, { marginBottom: 12 }]}>
              Información de Recarga
            </Text>
            <DetailRow label="Método" value="Saldo Khipu" />
            <DetailRow label="Procesado" value="Instantáneo" />
          </View>
        )}
      </ScrollView>

      {/* Footer Fijo */}
      <View style={globalStyles.footerContainer}>
        <TouchableOpacity 
          style={[globalStyles.button, globalStyles.buttonPrimary]}
          onPress={() => router.back()}
        >
          <Text style={globalStyles.buttonText}>Volver al historial</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Componente helper para filas de detalle
function DetailRow({ label, value, valueStyle }) {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#DEE2E6',
    }}>
      <Text style={[globalStyles.caption, { flex: 1, marginRight: 16 }]}>{label}</Text>
      <Text style={[globalStyles.body, { flex: 1, textAlign: 'right' }, valueStyle]}>{value}</Text>
    </View>
  );
}