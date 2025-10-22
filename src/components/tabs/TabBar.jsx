import { View, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';

// Mapeo de íconos
const tabIcons = {
  home: { focused: 'home', outline: 'home-outline' },
  wallet: { focused: 'card', outline: 'card-outline' },
  profile: { focused: 'person', outline: 'person-outline' },
};

const tabNames = {
  home: 'Inicio',
  wallet: 'Billetera', 
  profile: 'Perfil',
};

export function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      paddingBottom: insets.bottom,
    }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const label = tabNames[route.name] || route.name;
        const iconConfig = tabIcons[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = iconConfig 
          ? (isFocused ? iconConfig.focused : iconConfig.outline)
          : 'help-circle';

        return (
          <TouchableOpacity
            key={route.name}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: theme.spacing.sm,
            }}
          >
            <Ionicons 
              name={iconName} 
              size={24} 
              color={isFocused ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <Text style={{
              fontFamily: theme.typography.fontFamily.medium,
              fontSize: theme.typography.fontSize.xs,
              marginTop: theme.spacing.xs,
              color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
            }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}