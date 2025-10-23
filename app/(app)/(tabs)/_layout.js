// app/(app)/(tabs)/_layout.js (TU LAYOUT DE TABS, PERO MOVIDO)
import { Tabs } from 'expo-router';
// 1. ¡OJO! La ruta de importación sube un nivel
import { TabBar } from '../../../src/components/tabs/TabBar'; 
// (Ajusta '../../../' según dónde tengas tu 'components/TabBar.js')

export default function TabsLayout() {
  return (
    <Tabs
      // 2. Le pasamos tu TabBar personalizado
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false, // Ocultamos el header de CADA pestaña
      }}
    >
      <Tabs.Screen
        name="home" // (app)/(tabs)/home.js
      />
      <Tabs.Screen
        name="wallet" // (app)/(tabs)/wallet.js
      />
      <Tabs.Screen
        name="profile" // (app)/(tabs)/profile.js
      />
    </Tabs>
  );
}