import { View, Text, ScrollView } from 'react-native';
import useSafeArea from '../../../src/hooks/useSafeArea';
import useTheme from '../../../src/hooks/useTheme';
import { globalStyles } from '../../../src/styles/GlobalStyles';

export default function Wallet() {
  const { safeAreaInsets } = useSafeArea(false); // ← Cambiar a safeAreaInsets
  const theme = useTheme();
  
  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      <ScrollView 
        style={globalStyles.containerWithPadding}
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - SIN padding horizontal extra */}
        <View style={{ 
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
        }}>
          <Text style={globalStyles.title}>Mi Billetera</Text>
        </View>
        
        {/* Balance Total */}
        <View style={[globalStyles.card, { marginBottom: theme.spacing.lg }]}>
          <Text style={globalStyles.subtitle}>Balance Total</Text>
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
          
          <View style={globalStyles.card}>
            <Text style={globalStyles.caption}>• Recargar saldo</Text>
            <Text style={[globalStyles.caption, { marginTop: theme.spacing.xs }]}>
              • Retirar dinero
            </Text>
            <Text style={[globalStyles.caption, { marginTop: theme.spacing.xs }]}>
              • Enviar dinero
            </Text>
            <Text style={[globalStyles.caption, { marginTop: theme.spacing.xs }]}>
              • Solicitar dinero
            </Text>
          </View>
        </View>

        {/* Métodos de Pago */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <Text style={[globalStyles.subtitle, { marginBottom: theme.spacing.md }]}>
            Métodos de Pago
          </Text>
          <View style={globalStyles.card}>
            <Text style={globalStyles.caption}>• Tarjeta de débito **** 1234</Text>
            <Text style={[globalStyles.caption, { marginTop: theme.spacing.xs }]}>
              • Tarjeta de crédito **** 5678
            </Text>
            <Text style={[globalStyles.caption, { marginTop: theme.spacing.xs }]}>
              • Cuenta de ahorros BCP
            </Text>
          </View>
        </View>

        {/* Estadísticas */}
        <View>
          <Text style={[globalStyles.subtitle, { marginBottom: theme.spacing.md }]}>
            Estadísticas del Mes
          </Text>
          <View style={globalStyles.card}>
            <Text style={globalStyles.caption}>• Total enviado: S/ 350.00</Text>
            <Text style={[globalStyles.caption, { marginTop: theme.spacing.xs }]}>
              • Total recibido: S/ 500.00
            </Text>
            <Text style={[globalStyles.caption, { marginTop: theme.spacing.xs }]}>
              • Transacciones: 15
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}