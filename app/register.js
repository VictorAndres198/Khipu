import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import useSafeArea from '../src/hooks/useSafeArea';
import { globalStyles } from '../src/styles/GlobalStyles';
import { register, onAuthChange, getCurrentUser } from '../src/services/firebase/auth';

export default function Register() {
  const { safeAreaInsets } = useSafeArea(true);
  const router = useRouter();
  // ❌ ELIMINAR: const theme = useTheme(); // Esta línea causa el error

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    password: ''
  });
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

  const handleRegister = async () => {
    const { nombre, telefono, email, password } = formData;
    
    if (!nombre || !telefono || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, { nombre, telefono });
      Alert.alert('¡Cuenta creada!', 'Bienvenido a Khipu');
    } catch (error) {
      Alert.alert('Error al crear cuenta', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <Text style={globalStyles.title}>Crear Cuenta</Text>
          <Text style={[globalStyles.body, { marginTop: 8 }]}>
            Únete a Khipu y empieza a enviar dinero
          </Text>
        </View>

        <View style={{ marginTop: 32 }}>
          <TextInput
            style={globalStyles.input}
            placeholder="Nombre completo"
            value={formData.nombre}
            onChangeText={(value) => updateField('nombre', value)}
            editable={!loading}
          />

          <TextInput
            style={globalStyles.input}
            placeholder="Teléfono"
            value={formData.telefono}
            onChangeText={(value) => updateField('telefono', value)}
            keyboardType="phone-pad"
            editable={!loading}
          />

          <TextInput
            style={globalStyles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={globalStyles.input}
            placeholder="Contraseña"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity 
            style={[
              globalStyles.button, 
              globalStyles.buttonPrimary,
              loading && { opacity: 0.6 }
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={globalStyles.buttonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.button, globalStyles.buttonSecondary, { marginTop: 8 }]}
            onPress={() => router.push('/login')}
            disabled={loading}
          >
            <Text style={globalStyles.buttonTextSecondary}>
              ¿Ya tienes cuenta? Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}