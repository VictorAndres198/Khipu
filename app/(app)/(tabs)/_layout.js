import { Tabs } from 'expo-router';
import { TabBar } from '../../../src/components/tabs/TabBar';

export default function TabsLayout() {
  return (
    <Tabs 
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="wallet" options={{ title: 'Billetera' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}