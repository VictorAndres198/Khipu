import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function useSafeArea(includeBottom = false) {
  const insets = useSafeAreaInsets();
  
  return {
    // 🆕 SOLO áreas seguras, sin padding horizontal
    safeAreaInsets: {
      paddingTop: insets.top,
      paddingBottom: includeBottom ? insets.bottom : 0,
    },
    // 🆕 Valores numéricos para casos específicos
    insets: {
      top: insets.top,
      bottom: insets.bottom,
      left: insets.left,
      right: insets.right,
    }
  };
}