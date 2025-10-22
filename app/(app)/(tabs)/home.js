import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import useSafeArea from '../../../src/hooks/useSafeArea';
import useTheme from '../../../src/hooks/useTheme';
import { globalStyles } from '../../../src/styles/GlobalStyles';

export default function Home() {
  const { safeAreaInsets } = useSafeArea(false);
  const router = useRouter();
  const theme = useTheme();
  
  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      <ScrollView 
        style={globalStyles.containerWithPadding}
        contentContainerStyle={globalStyles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={globalStyles.headerContainerNoPadding}>
          <Text style={globalStyles.title}>Inicio - Balance Rápido</Text>
        </View>
        
        {/* Balance Card */}
        <View style={[globalStyles.card, { marginBottom: theme.spacing.lg }]}>
          <Text style={globalStyles.subtitle}>Balance Actual</Text>
          <Text style={[
            globalStyles.title, 
            { 
              color: theme.colors.primary, 
              marginTop: theme.spacing.xs,
              fontSize: theme.typography.fontSize.xxxl 
            }
          ]}>
            S/ 1,250.00
          </Text>
        </View>
        
        {/* Acciones Rápidas */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <Text style={[globalStyles.subtitle, { marginBottom: theme.spacing.md }]}>
            Acciones Rápidas
          </Text>
          
          <TouchableOpacity 
            style={[globalStyles.button, globalStyles.buttonPrimary, { marginBottom: theme.spacing.sm }]}
            onPress={() => router.push('/transactions')}
          >
            <Text style={globalStyles.buttonText}>Ver Historial Completo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[globalStyles.button, globalStyles.buttonSecondary]}
            onPress={() => router.push('/transactions/1')}
          >
            <Text style={globalStyles.buttonText}>Ver Transacción Ejemplo</Text>
          </TouchableOpacity>
        </View>
        
        {/* Últimas Transacciones (ejemplo) */}
        <View>
          <Text style={[globalStyles.subtitle, { marginBottom: theme.spacing.md }]}>
            Últimas Transacciones
          </Text>
          <View style={globalStyles.card}>
            <Text style={globalStyles.caption}>
              • Pago a María - S/ 50.00 (Hoy)
            </Text>
            <Text style={[globalStyles.caption, { marginTop: theme.spacing.xs }]}>
              • Recarga celular - S/ 20.00 (Ayer)
            </Text>
            <Text style={[globalStyles.caption, { marginTop: theme.spacing.xs }]}>
              • Recibido de Juan +S/ 100.00 (15 Ene)
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}