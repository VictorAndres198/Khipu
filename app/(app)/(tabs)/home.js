import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import useSafeArea from '../../../src/hooks/useSafeArea';
import useTheme from '../../../src/hooks/useTheme';
import { globalStyles } from '../../../src/styles/GlobalStyles';

export default function Home() {
  const { safeAreaStyles } = useSafeArea();
  const router = useRouter();
  const theme = useTheme();
  
  return (
    <View style={[globalStyles.containerPadding, safeAreaStyles]}>
      <Text style={globalStyles.title}>Inicio - Balance Rápido</Text>
      
      <View style={[globalStyles.card, { marginTop: theme.spacing.lg }]}>
        <Text style={globalStyles.subtitle}>Balance Actual</Text>
        <Text style={[globalStyles.title, { color: theme.colors.primary }]}>
          S/ 1,250.00
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[globalStyles.button, globalStyles.buttonPrimary, { marginTop: theme.spacing.lg }]}
        onPress={() => router.push('/transactions')}
      >
        <Text style={globalStyles.buttonText}>Ver Historial Completo</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[globalStyles.button, globalStyles.buttonSecondary, { marginTop: theme.spacing.md }]}
        onPress={() => router.push('/transactions/1')}
      >
        <Text style={globalStyles.buttonText}>Ver Transacción Ejemplo</Text>
      </TouchableOpacity>
    </View>
  );
}