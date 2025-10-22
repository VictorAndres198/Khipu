import { Slot } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../src/hooks/useTheme';
import theme from '../src/styles/themes';

export default function Layout() {
  return(
    <SafeAreaProvider>
        <ThemeProvider value={theme}>
            <Slot/>
        </ThemeProvider>
    </SafeAreaProvider>
  );
}