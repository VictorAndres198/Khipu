import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import useSafeArea from '../../../src/hooks/useSafeArea';
import useTheme from '../../../src/hooks/useTheme';
import { globalStyles } from '../../../src/styles/GlobalStyles';

const transactions = [
  { id: '1', amount: -50, description: 'Pago a María', date: '2024-01-15' },
  { id: '2', amount: -20, description: 'Recarga celular', date: '2024-01-14' },
  { id: '3', amount: 100, description: 'Recibido de Juan', date: '2024-01-13' },
];

export default function TransactionsList() {
  const { safeAreaStyles } = useSafeArea();
  const router = useRouter();
  const theme = useTheme();

  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        globalStyles.card, 
        { 
          marginBottom: theme.spacing.sm,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      ]}
      onPress={() => router.push(`/transactions/${item.id}`)}
    >
      <View style={{ flex: 1 }}>
        <Text style={globalStyles.body}>{item.description}</Text>
        <Text style={globalStyles.caption}>{item.date}</Text>
      </View>
      <Text style={[
        globalStyles.body,
        { 
          fontWeight: 'bold',
          color: item.amount > 0 ? theme.colors.success : theme.colors.text 
        }
      ]}>
        {item.amount > 0 ? '+' : ''}S/ {Math.abs(item.amount)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[globalStyles.containerPadding, safeAreaStyles]}>
      <Text style={globalStyles.title}>Historial de Transacciones</Text>
      
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={renderTransactionItem}
        style={{ marginTop: theme.spacing.lg }}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity 
        style={[globalStyles.button, globalStyles.buttonPrimary, { marginTop: theme.spacing.lg }]}
        onPress={() => router.back()}
      >
        <Text style={globalStyles.buttonText}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  );
}