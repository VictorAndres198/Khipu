import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useSafeArea from '../../../src/hooks/useSafeArea';
import useTheme from '../../../src/hooks/useTheme';
import { globalStyles } from '../../../src/styles/GlobalStyles';

const transactionDetails = {
  '1': { 
    amount: -50, 
    description: 'Pago a María', 
    date: '15 Ene 2024', 
    time: '14:30',
    type: 'Envío',
    category: 'Transferencia',
    status: 'Completado'
  },
  '2': { 
    amount: -20, 
    description: 'Recarga celular', 
    date: '14 Ene 2024', 
    time: '10:15',
    type: 'Pago de servicio',
    category: 'Recarga',
    status: 'Completado'
  },
  '3': { 
    amount: 100, 
    description: 'Recibido de Juan', 
    date: '13 Ene 2024', 
    time: '16:45',
    type: 'Recepción',
    category: 'Transferencia',
    status: 'Completado'
  },
  '4': { 
    amount: -35, 
    description: 'Almuerzo en restaurant', 
    date: '12 Ene 2024', 
    time: '13:20',
    type: 'Pago',
    category: 'Alimentación',
    status: 'Completado'
  },
  '5': { 
    amount: 80, 
    description: 'Pago de cliente', 
    date: '11 Ene 2024', 
    time: '09:45',
    type: 'Recepción',
    category: 'Trabajo',
    status: 'Completado'
  },
};

export default function TransactionDetail() {
  const { id } = useLocalSearchParams();
  const { safeAreaInsets } = useSafeArea(true);
  const router = useRouter();
  const theme = useTheme();

  const transaction = transactionDetails[id] || {
    amount: 0, 
    description: 'Transacción no encontrada', 
    date: 'N/A', 
    type: 'desconocido'
  };

  const isPositive = transaction.amount > 0;

  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      {/* Header Fijo - SIN padding horizontal extra */}
      <View style={{ 
        paddingHorizontal: theme.spacing.md, // ← Agrega esto
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.sm,
      }}>
        <Text style={globalStyles.title}>Detalle de Transacción</Text>
      </View>
      
      {/* Contenido Scrollable */}
      <ScrollView 
        style={globalStyles.containerWithPadding}
        contentContainerStyle={[globalStyles.scrollContent, { paddingBottom: theme.spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Monto */}
        <View style={[
          globalStyles.card, 
          { 
            alignItems: 'center', 
            backgroundColor: isPositive ? `${theme.colors.success}15` : `${theme.colors.error}15`
          }
        ]}>
          <Text style={[
            globalStyles.title,
            { 
              color: isPositive ? theme.colors.success : theme.colors.error,
              fontSize: theme.typography.fontSize.xxxl
            }
          ]}>
            {isPositive ? '+' : '-'}S/ {Math.abs(transaction.amount)}
          </Text>
          <Text style={[globalStyles.body, { marginTop: theme.spacing.xs }]}>
            {transaction.description}
          </Text>
        </View>

        {/* Información detallada */}
        <View style={[globalStyles.card, { marginTop: theme.spacing.lg }]}>
          <Text style={[globalStyles.subtitle, { marginBottom: theme.spacing.md }]}>
            Información
          </Text>
          
          <DetailRow label="Fecha y hora" value={`${transaction.date} • ${transaction.time}`} />
          <DetailRow label="Tipo" value={transaction.type} />
          <DetailRow label="Categoría" value={transaction.category} />
          <DetailRow 
            label="Estado" 
            value={transaction.status} 
            valueStyle={{ 
              color: transaction.status === 'Completado' ? theme.colors.success : theme.colors.warning,
              fontWeight: 'bold'
            }}
          />
          <DetailRow label="ID de transacción" value={id} />
        </View>
      </ScrollView>

      {/* Footer Fijo */}
      <View style={globalStyles.footerContainer}>
        <TouchableOpacity 
          style={[globalStyles.button, globalStyles.buttonPrimary]}
          onPress={() => router.back()}
        >
          <Text style={globalStyles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Componente helper para filas de detalle
function DetailRow({ label, value, valueStyle }) {
  const theme = useTheme();
  
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    }}>
      <Text style={[globalStyles.caption, { flex: 1, marginRight: theme.spacing.md }]}>{label}</Text>
      <Text style={[globalStyles.body, { flex: 1, textAlign: 'right' }, valueStyle]}>{value}</Text>
    </View>
  );
}