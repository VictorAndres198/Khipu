import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import useSafeArea from '../src/hooks/useSafeArea';
import { globalStyles } from '../src/styles/GlobalStyles';
import { login, onAuthChange, getCurrentUser } from '../src/services/firebase/auth';

export default function Login() {
  const { safeAreaInsets } = useSafeArea(true);
  const router = useRouter();
  // ❌ ELIMINAR: const theme = useTheme(); // Esta línea causa el error

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useFocusEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        setTimeout(() => {
          router.replace('/(app)');
        }, 100);
      } else {
        setIsCheckingAuth(false);
      }
    });

    const currentUser = getCurrentUser();
    if (currentUser) {
      setTimeout(() => {
        router.replace('/(app)');
      }, 100);
    } else {
      setIsCheckingAuth(false);
    }

    return unsubscribe;
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Error de inicio de sesión', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <View style={[globalStyles.container, safeAreaInsets, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text style={[globalStyles.body, { marginTop: 16 }]}>Verificando...</Text>
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      <ScrollView 
        style={globalStyles.containerWithPadding}
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: 40, paddingBottom: 24 }}>
          <Text style={globalStyles.title}>Iniciar Sesión</Text>
          <Text style={[globalStyles.body, { marginTop: 8 }]}>
            Bienvenido de vuelta a Khipu
          </Text>
        </View>

        <View style={{ marginTop: 32 }}>
          <TextInput
            style={globalStyles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={globalStyles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity 
            style={[
              globalStyles.button, 
              globalStyles.buttonPrimary,
              loading && { opacity: 0.6 }
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={globalStyles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.button, globalStyles.buttonSecondary, { marginTop: 8 }]}
            onPress={() => router.push('/register')}
            disabled={loading}
          >
            <Text style={globalStyles.buttonTextSecondary}>
              ¿No tienes cuenta? Regístrate
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}