import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import useSafeArea from '../../../src/hooks/useSafeArea';
import useTheme from '../../../src/hooks/useTheme';
import { globalStyles } from '../../../src/styles/GlobalStyles';

const transactions = [
  { id: '1', amount: -50, description: 'Pago a María', date: '15 Ene 2024' },
  { id: '2', amount: -20, description: 'Recarga celular', date: '14 Ene 2024' },
  { id: '3', amount: 100, description: 'Recibido de Juan', date: '13 Ene 2024' },
  { id: '4', amount: -35, description: 'Almuerzo', date: '12 Ene 2024' },
  { id: '5', amount: 80, description: 'Pago de cliente', date: '11 Ene 2024' },
];

export default function TransactionsList() {
  const { safeAreaInsets } = useSafeArea(true);
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
    <View style={[globalStyles.container, safeAreaInsets]}>
      {/* Header Fijo - SIN padding horizontal extra */}
    <View style={{
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md, // ← Agrega esto
    }}>
        <Text style={globalStyles.title}>Historial de Transacciones</Text>
      </View>
      
      {/* Lista con padding */}
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={renderTransactionItem}
        style={globalStyles.containerWithPadding}
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
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