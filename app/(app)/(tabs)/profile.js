import { View, Text, ScrollView } from 'react-native';
import useSafeArea from '../../../src/hooks/useSafeArea';
import useTheme from '../../../src/hooks/useTheme';
import { globalStyles } from '../../../src/styles/GlobalStyles';

export default function Profile() {
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
          <Text style={globalStyles.title}>Mi Perfil</Text>
        </View>
        
        {/* Información del Usuario */}
        <View style={[globalStyles.card, { marginBottom: theme.spacing.lg }]}>
          <Text style={globalStyles.subtitle}>Información Personal</Text>
          <View style={{ marginTop: theme.spacing.md }}>
            <Text style={globalStyles.body}>Nombre: Juan Pérez</Text>
            <Text style={[globalStyles.body, { marginTop: theme.spacing.xs }]}>
              Teléfono: +51 999 888 777
            </Text>
            <Text style={[globalStyles.body, { marginTop: theme.spacing.xs }]}>
              Email: juan@khipu.com
            </Text>
          </View>
        </View>

        {/* Configuración */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <Text style={[globalStyles.subtitle, { marginBottom: theme.spacing.md }]}>
            Configuración
          </Text>
          
          <View style={globalStyles.card}>
            <Text style={globalStyles.caption}>• Notificaciones push</Text>
            <Text style={[globalStyles.caption, { marginTop: theme.spacing.xs }]}>
              • Verificación en dos pasos
            </Text>
            <Text style={[globalStyles.caption, { marginTop: theme.spacing.xs }]}>
              • Idioma: Español
            </Text>
          </View>
        </View>

        {/* Seguridad */}
        <View>
          <Text style={[globalStyles.subtitle, { marginBottom: theme.spacing.md }]}>
            Seguridad
          </Text>
          <View style={globalStyles.card}>
            <Text style={globalStyles.caption}>• Cambiar contraseña</Text>
            <Text style={[globalStyles.caption, { marginTop: theme.spacing.xs }]}>
              • Gestionar dispositivos
            </Text>
            <Text style={[globalStyles.caption, { marginTop: theme.spacing.xs }]}>
              • Cerrar sesión en todos los dispositivos
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}