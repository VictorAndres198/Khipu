import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" />
      
      <Stack.Screen 
        name="transactions" 
        options={{
          presentation: 'modal', 
          animation: 'slide_from_bottom', 
        }}
      />
    </Stack>
  );
}