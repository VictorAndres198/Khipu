import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import useSafeArea from '../../../src/hooks/useSafeArea';
import { globalStyles } from '../../../src/styles/GlobalStyles';
import { getCurrentUser, logout } from '../../../src/services/firebase/auth';
import { getUser, updateUserBalance } from '../../../src/services/firebase/firestore';

export default function Profile() {
  const { safeAreaInsets } = useSafeArea(false);
  const router = useRouter();
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    twoFactor: false,
    language: 'es'
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const user = getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await getUser(user.uid);
      setUserData(data);
    } catch (error) {
      console.error('Error cargando datos del perfil:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  };

const handleLogout = async () => {
  Alert.alert(
    'Cerrar Sesión',
    '¿Estás seguro de que quieres cerrar sesión?',
    [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Cerrar Sesión', 
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            // ✅ CORREGIDO: Redirigir al login en lugar de la bienvenida
            router.replace('/login');
          } catch (error) {
            Alert.alert('Error', 'No se pudo cerrar sesión');
          }
        }
      }
    ]
  );
};

  const handleSettingToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    Alert.alert('Configuración actualizada', `La configuración ha sido ${!settings[setting] ? 'activada' : 'desactivada'}`);
  };

  const handleAddTestBalance = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      await updateUserBalance(user.uid, 1000);
      Alert.alert('✅ Saldo agregado', 'Se agregaron S/ 1000 a tu cuenta de prueba');
      await loadUserData();
    } catch (error) {
      Alert.alert('❌ Error', error.message);
    }
  };

  const handleResetBalance = async () => {
    const user = getCurrentUser();
    if (!user) return;

    Alert.alert(
      'Reiniciar Saldo',
      '¿Estás seguro de que quieres reiniciar tu saldo a S/ 0?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Reiniciar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await updateUserBalance(user.uid, 0);
              Alert.alert('✅ Saldo reiniciado', 'Tu saldo ha sido reiniciado a S/ 0');
              await loadUserData();
            } catch (error) {
              Alert.alert('❌ Error', error.message);
            }
          }
        }
      ]
    );
  };

  // Estado de carga
  if (loading) {
    return (
      <View style={[globalStyles.container, safeAreaInsets, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text style={[globalStyles.body, { marginTop: 16 }]}>Cargando perfil...</Text>
      </View>
    );
  }

  const user = getCurrentUser();

  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      <ScrollView 
        style={globalStyles.containerWithPadding}
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={globalStyles.headerContainerNoPadding}>
          <Text style={globalStyles.title}>Mi Perfil</Text>
          <Text style={[globalStyles.body, { marginTop: 8 }]}>
            Gestiona tu cuenta y configuración
          </Text>
        </View>
        
        {/* Información del Usuario */}
        <View style={[globalStyles.card, { marginBottom: 24 }]}>
          <Text style={globalStyles.subtitle}>Información Personal</Text>
          
          <View style={{ marginTop: 16, gap: 12 }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View style={{ flex: 1 }}>
                <Text style={globalStyles.caption}>Nombre completo</Text>
                <Text style={globalStyles.body}>
                  {userData?.nombre || 'No disponible'}
                </Text>
              </View>
              <TouchableOpacity>
                <Text style={[globalStyles.caption, { color: '#2E86AB' }]}>Editar</Text>
              </TouchableOpacity>
            </View>

            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View style={{ flex: 1 }}>
                <Text style={globalStyles.caption}>Teléfono</Text>
                <Text style={globalStyles.body}>
                  {userData?.telefono || 'No disponible'}
                </Text>
              </View>
              <TouchableOpacity>
                <Text style={[globalStyles.caption, { color: '#2E86AB' }]}>Editar</Text>
              </TouchableOpacity>
            </View>

            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View style={{ flex: 1 }}>
                <Text style={globalStyles.caption}>Email</Text>
                <Text style={globalStyles.body}>
                  {user?.email || 'No disponible'}
                </Text>
              </View>
              <TouchableOpacity>
                <Text style={[globalStyles.caption, { color: '#2E86AB' }]}>Editar</Text>
              </TouchableOpacity>
            </View>

            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View style={{ flex: 1 }}>
                <Text style={globalStyles.caption}>ID de Usuario</Text>
                <Text style={[globalStyles.caption, { fontSize: 12 }]}>
                  {user?.uid || 'No disponible'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Configuración */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
            Configuración
          </Text>
          
          <View style={globalStyles.card}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12
            }}>
              <View style={{ flex: 1 }}>
                <Text style={globalStyles.body}>Notificaciones push</Text>
                <Text style={globalStyles.caption}>Recibir notificaciones de transacciones</Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={() => handleSettingToggle('notifications')}
                trackColor={{ false: '#E9ECEF', true: '#2E86AB' }}
                thumbColor={settings.notifications ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
              borderTopWidth: 1,
              borderTopColor: '#E9ECEF'
            }}>
              <View style={{ flex: 1 }}>
                <Text style={globalStyles.body}>Verificación en dos pasos</Text>
                <Text style={globalStyles.caption}>Mayor seguridad para tu cuenta</Text>
              </View>
              <Switch
                value={settings.twoFactor}
                onValueChange={() => handleSettingToggle('twoFactor')}
                trackColor={{ false: '#E9ECEF', true: '#2E86AB' }}
                thumbColor={settings.twoFactor ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
              borderTopWidth: 1,
              borderTopColor: '#E9ECEF'
            }}>
              <View style={{ flex: 1 }}>
                <Text style={globalStyles.body}>Idioma</Text>
                <Text style={globalStyles.caption}>Español</Text>
              </View>
              <TouchableOpacity>
                <Text style={[globalStyles.caption, { color: '#2E86AB' }]}>Cambiar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Seguridad */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
            Seguridad
          </Text>
          
          <View style={globalStyles.card}>
            <TouchableOpacity 
              style={{ paddingVertical: 12 }}
              onPress={() => Alert.alert('Próximamente', 'Funcionalidad de cambio de contraseña en desarrollo')}
            >
              <Text style={globalStyles.body}>🔒 Cambiar contraseña</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E9ECEF' }}
              onPress={() => Alert.alert('Próximamente', 'Funcionalidad de gestión de dispositivos en desarrollo')}
            >
              <Text style={globalStyles.body}>📱 Gestionar dispositivos</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E9ECEF' }}
              onPress={() => Alert.alert('Próximamente', 'Funcionalidad de cierre de sesión remoto en desarrollo')}
            >
              <Text style={globalStyles.body}>🚪 Cerrar sesión en todos los dispositivos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Herramientas de Desarrollo (solo para testing) */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
            Herramientas de Desarrollo
          </Text>
          
          <View style={globalStyles.card}>
            <TouchableOpacity 
              style={{ paddingVertical: 12 }}
              onPress={handleAddTestBalance}
            >
              <Text style={globalStyles.body}>💰 Agregar saldo de prueba (S/ 1000)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E9ECEF' }}
              onPress={handleResetBalance}
            >
              <Text style={[globalStyles.body, { color: '#F44336' }]}>🔄 Reiniciar saldo a S/ 0</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información de la Cuenta */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
            Información de la Cuenta
          </Text>
          
          <View style={globalStyles.card}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 8
            }}>
              <Text style={globalStyles.caption}>Fecha de registro</Text>
              <Text style={globalStyles.body}>
                {userData?.fechaRegistro ? new Date(userData.fechaRegistro).toLocaleDateString('es-ES') : 'No disponible'}
              </Text>
            </View>

            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 8,
              borderTopWidth: 1,
              borderTopColor: '#E9ECEF'
            }}>
              <Text style={globalStyles.caption}>Última actualización</Text>
              <Text style={globalStyles.body}>
                {userData?.ultimaActualizacion ? new Date(userData.ultimaActualizacion).toLocaleDateString('es-ES') : 'No disponible'}
              </Text>
            </View>

            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 8,
              borderTopWidth: 1,
              borderTopColor: '#E9ECEF'
            }}>
              <Text style={globalStyles.caption}>Estado de verificación</Text>
              <Text style={[globalStyles.body, { color: user?.emailVerified ? '#4CAF50' : '#FF9800' }]}>
                {user?.emailVerified ? 'Verificado' : 'Pendiente'}
              </Text>
            </View>
          </View>
        </View>

        {/* Cerrar Sesión */}
        <View style={{ marginBottom: 32 }}>
          <TouchableOpacity 
            style={[
              globalStyles.button, 
              { 
                backgroundColor: '#F44336',
                marginBottom: 12
              }
            ]}
            onPress={handleLogout}
          >
            <Text style={[globalStyles.buttonText, { color: '#FFFFFF' }]}>
              🚪 Cerrar Sesión
            </Text>
          </TouchableOpacity>

          <Text style={[globalStyles.caption, { textAlign: 'center' }]}>
            Versión 1.0.0 • Khipu App
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}