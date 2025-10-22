import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function useSafeArea() {
  const insets = useSafeAreaInsets();
  
  return {
    safeAreaStyles: {
      paddingTop: insets.top,
      //paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    insets
  };
}