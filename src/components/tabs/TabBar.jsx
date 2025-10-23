import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
// 1. Importamos tu hook 'useSafeArea'
import useSafeArea from '../../hooks/useSafeArea';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';

// Mapeo de íconos (sin cambios)
const tabIcons = {
  home: { focused: 'home', outline: 'home-outline' },
  wallet: { focused: 'card', outline: 'card-outline' },
  profile: { focused: 'person', outline: 'person-outline' },
};

// Mapeo de nombres (sin cambios)
const tabNames = {
  home: 'Inicio',
  wallet: 'Billetera',
  profile: 'Perfil',
};

export function TabBar({ state, descriptors, navigation }) {
  // 2. Usamos tu hook con 'true' para incluir el padding inferior
  const { insets } = useSafeArea(true); 
  const { theme } = useTheme();

  // 3. Creamos los estilos con useMemo para que no se recalculen
  // en cada render, solo si el tema o los insets cambian.
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      paddingBottom: insets.bottom, // 👈 Padding del hook
      paddingHorizontal: theme.spacing.md,
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    tabLabel: {
      fontFamily: theme.typography.fontFamily.medium,
      fontSize: theme.typography.fontSize.xs,
      marginTop: theme.spacing.xs,
    },
  }), [theme, insets.bottom]); // 👈 Dependencias

  return (
    // 4. Aplicamos el estilo del contenedor
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const label = tabNames[route.name] || route.name;
        const iconConfig = tabIcons[route.name];

        const onPress = () => {
          // ... (tu lógica de onPress no cambia)
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
        
        // 5. Definimos el color dinámico
        const activeColor = theme.colors.primary;
        const inactiveColor = theme.colors.textSecondary;
        const color = isFocused ? activeColor : inactiveColor;

        return (
          <TouchableOpacity
            key={route.name}
            onPress={onPress}
            // 6. Aplicamos el estilo del botón
            style={styles.tabButton}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel || label}
          >
            <Ionicons 
              name={iconName} 
              size={24} 
              color={color} // 👈 Color dinámico
            />
            <Text style={[
              styles.tabLabel, // 👈 Estilo base
              { color: color } // 👈 Color dinámico
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}