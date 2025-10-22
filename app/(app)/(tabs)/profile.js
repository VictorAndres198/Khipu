import { View, Text } from 'react-native';
import useSafeArea from '../../../src/hooks/useSafeArea';
import useTheme from '../../../src/hooks/useTheme';
import { globalStyles } from '../../../src/styles/GlobalStyles';

export default function Profile() {
  const { safeAreaStyles } = useSafeArea();
  const theme = useTheme();
  
  return (
    <View style={[globalStyles.containerPadding, safeAreaStyles]}>
      <Text style={globalStyles.title}>Mi Perfil</Text>
      
      <View style={[globalStyles.card, { marginTop: theme.spacing.lg }]}>
        <Text style={globalStyles.body}>Aquí irá tu información de perfil y configuración</Text>
      </View>
    </View>
  );
}