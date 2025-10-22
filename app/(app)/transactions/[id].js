import { View, Text, TouchableOpacity } from 'react-native';
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
};

export default function TransactionDetail() {
  const { id } = useLocalSearchParams();
  const { safeAreaStyles } = useSafeArea();
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
    <View style={[globalStyles.containerPadding, safeAreaStyles]}>
      <Text style={globalStyles.title}>Detalle de Transacción</Text>
      
      {/* Monto */}
      <View style={[
        globalStyles.card, 
        { 
          alignItems: 'center', 
          marginTop: theme.spacing.lg,
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
      
      <TouchableOpacity 
        style={[globalStyles.button, globalStyles.buttonPrimary, { marginTop: theme.spacing.xl }]}
        onPress={() => router.back()}
      >
        <Text style={globalStyles.buttonText}>Volver</Text>
      </TouchableOpacity>
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
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    }}>
      <Text style={globalStyles.caption}>{label}</Text>
      <Text style={[globalStyles.body, valueStyle]}>{value}</Text>
    </View>
  );
}