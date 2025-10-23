import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Switch,
  StyleSheet 
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 1. Hooks de la App
import useSafeArea from '../../../src/hooks/useSafeArea';
import { useGlobalStyles } from '../../../src/hooks/useGlobalStyles'; // 👈 Dinámico
import useTheme from '../../../src/hooks/useTheme'; // 👈 Dinámico

// 2. Firebase
import { getCurrentUser, logout } from '../../../src/services/firebase/auth';
import { getUser, updateUserBalance } from '../../../src/services/firebase/firestore';

import Toast from 'react-native-toast-message';

export default function Profile() {
  const { safeAreaInsets } = useSafeArea(false);
  const router = useRouter();

  // 3. Hooks de estilo y tema
  const globalStyles = useGlobalStyles();
  const { theme, themeMode, setThemeMode } = useTheme();
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    twoFactor: false,
  });

  // 4. Lógica de datos (sin cambios)
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true); // 👈 Asegurarse de poner loading al recargar
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
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar los datos del perfil' });
    } finally {
      setLoading(false);
    }
  };

  // 5. Handlers (sin cambios en la lógica)
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
  };

  // ... (handlers de dev tools sin cambios en lógica)
  const handleAddTestBalance = async () => {
    const user = getCurrentUser();
    if (!user) return;
    try {
      await updateUserBalance(user.uid, 1000);
      Toast.show({ type: 'success', text1: 'Saldo Agregado', text2: 'Se agregaron S/ 1000 a tu cuenta' });
      await loadUserData();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    }
  };

  const handleResetBalance = async () => {
    // ... (lógica de alerta y reinicio)
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
               Toast.show({ type: 'success', text1: 'Saldo Reiniciado', text2: 'Tu saldo es S/ 0' });
               await loadUserData();
             } catch (error) {
               Toast.show({ type: 'error', text1: 'Error', text2: error.message });
             }
           }
         }
       ]
   );
  };

  // 6. Estilos locales dinámicos
  const localStyles = useMemo(() => StyleSheet.create({
    loadingText: {
      ...globalStyles.body,
      marginTop: theme.spacing.md,
      color: theme.colors.textSecondary,
    },
    scrollContainer: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    headerContainer: {
      paddingBottom: theme.spacing.lg,
    },
    headerSubtitle: {
      ...globalStyles.body,
      marginTop: theme.spacing.sm,
      color: theme.colors.textSecondary,
    },
    // Contenedor de sección (Tarjeta)
    sectionCard: {
      ...globalStyles.card,
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.md, // Añadimos padding por defecto
    },
    sectionTitle: {
      ...globalStyles.subtitle,
      marginBottom: theme.spacing.md,
    },
    // Fila de Info (Label arriba, Valor abajo)
    infoItem: {
      gap: theme.spacing.xs,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    infoLabel: {
      ...globalStyles.caption,
    },
    infoValue: {
      ...globalStyles.body,
    },
    infoValueSmall: {
      ...globalStyles.caption,
      fontSize: theme.typography.fontSize.xs,
    },
    infoEditButtonText: {
      ...globalStyles.caption,
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.medium,
    },
    // Fila de Configuración (Texto + Switch/Botón)
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    settingRowBorder: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    settingTextContainer: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    settingLabel: { ...globalStyles.body },
    settingDescription: { ...globalStyles.caption, marginTop: 2 },
    // Fila de Menú (Icono + Texto)
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    menuItemText: {
      ...globalStyles.body,
    },
    menuItemTextSuccess: {
      ...globalStyles.body,
      color: theme.colors.success,
      fontFamily: theme.typography.fontFamily.medium,
    },
    menuItemTextDestructive: {
      ...globalStyles.body,
      color: theme.colors.error,
      fontFamily: theme.typography.fontFamily.medium,
    },
    // Fila de Info (Label Izq, Valor Der)
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    statusVerified: {
      ...globalStyles.body,
      color: theme.colors.success,
      fontFamily: theme.typography.fontFamily.medium,
    },
    statusPending: {
      ...globalStyles.body,
      color: theme.colors.warning,
      fontFamily: theme.typography.fontFamily.medium,
    },
    // Footer
    logoutButton: {
      ...globalStyles.button,
      backgroundColor: theme.colors.error,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    logoutButtonText: {
      ...globalStyles.buttonText, // Ya es 'onPrimary' (blanco)
    },
    versionText: {
      ...globalStyles.caption,
      textAlign: 'center',
    },
    //Estilos para modo claro/oscuro
    appearanceButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    appearanceButton: {
      ...globalStyles.button,
      ...globalStyles.buttonSecondary,
      flex: 1,
      paddingVertical: theme.spacing.sm,
    },
    appearanceButtonActive: {
      backgroundColor: theme.colors.primary, // Color primario (verde menta)
      borderColor: theme.colors.primary,
      borderWidth: 1,
    },
    appearanceButtonText: {
      ...globalStyles.buttonTextSecondary,
    },
    appearanceButtonTextActive: {
      ...globalStyles.buttonText, // Texto 'onPrimary' (blanco)
    }
  }), [globalStyles, theme]);

  // --- Estado de Carga ---
  if (loading) {
    return (
      // 1. 'loadingContainer' tiene el color de fondo del tema
      <View style={[globalStyles.loadingContainer, safeAreaInsets]}>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary} // 2. Color primario del tema
        />
        <Text style={{
          ...globalStyles.body, // 3. Estilo base del tema
          marginTop: theme.spacing.md, // 4. Espacio del tema
          color: theme.colors.textSecondary // 5. Color de texto del tema
        }}>
          Cargando...
        </Text>
      </View>
    );
  }

  const user = getCurrentUser();

  // --- Pantalla Principal ---
  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      <ScrollView 
        contentContainerStyle={localStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={localStyles.headerContainer}>
          <Text style={globalStyles.title}>Mi Perfil</Text>
          <Text style={localStyles.headerSubtitle}>
            Gestiona tu cuenta y configuración
          </Text>
        </View>
        
        {/* Información del Usuario */}
        <View style={localStyles.sectionCard}>
          <Text style={localStyles.sectionTitle}>Información Personal</Text>
          <View style={{ gap: theme.spacing.md }}>
            <View style={localStyles.infoRow}>
              <View style={localStyles.infoItem}>
                <Text style={localStyles.infoLabel}>Nombre completo</Text>
                <Text style={localStyles.infoValue}>
                  {userData?.nombre || 'No disponible'}
                </Text>
              </View>
              <TouchableOpacity>
                <Text style={localStyles.infoEditButtonText}>Editar</Text>
              </TouchableOpacity>
            </View>

            <View style={localStyles.infoRow}>
              <View style={localStyles.infoItem}>
                <Text style={localStyles.infoLabel}>Teléfono</Text>
                <Text style={localStyles.infoValue}>
                  {userData?.telefono || 'No disponible'}
                </Text>
              </View>
              <TouchableOpacity>
                <Text style={localStyles.infoEditButtonText}>Editar</Text>
              </TouchableOpacity>
            </View>

            <View style={localStyles.infoItem}>
              <Text style={localStyles.infoLabel}>Email</Text>
              <Text style={localStyles.infoValue}>
                {user?.email || 'No disponible'}
              </Text>
            </View>

            <View style={localStyles.infoItem}>
              <Text style={localStyles.infoLabel}>ID de Usuario</Text>
              <Text style={localStyles.infoValueSmall}>
                {user?.uid || 'No disponible'}
              </Text>
            </View>
          </View>
        </View>

        {/* Configuración */}
        <View style={localStyles.sectionCard}>
          <Text style={localStyles.sectionTitle}>Configuración</Text>
          <View>
    

            <View style={{ paddingBottom: theme.spacing.sm }}>
              <View style={localStyles.settingTextContainer}>
                <Text style={localStyles.settingLabel}>Apariencia</Text>
                <Text style={localStyles.settingDescription}>
                  Selecciona tu tema preferido
                </Text>
              </View>
              <View style={localStyles.appearanceButtons}>
                <TouchableOpacity
                  style={[
                    localStyles.appearanceButton,
                    themeMode === 'light' && localStyles.appearanceButtonActive
                  ]}
                  onPress={() => setThemeMode('light')}
                >
                  <Text style={themeMode === 'light' ? localStyles.appearanceButtonTextActive : localStyles.appearanceButtonText}>
                    Claro
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    localStyles.appearanceButton,
                    themeMode === 'dark' && localStyles.appearanceButtonActive
                  ]}
                  onPress={() => setThemeMode('dark')}
                >
                  <Text style={themeMode === 'dark' ? localStyles.appearanceButtonTextActive : localStyles.appearanceButtonText}>
                    Oscuro
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    localStyles.appearanceButton,
                    themeMode === 'system' && localStyles.appearanceButtonActive
                  ]}
                  onPress={() => setThemeMode('system')}
                >
                  <Text style={themeMode === 'system' ? localStyles.appearanceButtonTextActive : localStyles.appearanceButtonText}>
                    Sistema
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={localStyles.settingRow}>
              <View style={localStyles.settingTextContainer}>
                <Text style={localStyles.settingLabel}>Notificaciones push</Text>
                <Text style={localStyles.settingDescription}>Recibir notificaciones de transacciones</Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={() => handleSettingToggle('notifications')}
                trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
                thumbColor={theme.colors.onPrimary}
              />
            </View>

            <View style={[localStyles.settingRow, localStyles.settingRowBorder]}>
              <View style={localStyles.settingTextContainer}>
                <Text style={localStyles.settingLabel}>Verificación en dos pasos</Text>
                <Text style={localStyles.settingDescription}>Mayor seguridad para tu cuenta</Text>
              </View>
              <Switch
                value={settings.twoFactor}
                onValueChange={() => handleSettingToggle('twoFactor')}
                trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
                thumbColor={theme.colors.onPrimary}
              />
            </View>
            
            <View style={[localStyles.settingRow, localStyles.settingRowBorder]}>
              <View style={localStyles.settingTextContainer}>
                <Text style={localStyles.settingLabel}>Idioma</Text>
                <Text style={localStyles.settingDescription}>Español</Text>
              </View>
              <TouchableOpacity>
                <Text style={localStyles.infoEditButtonText}>Cambiar</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </View>

        {/* Seguridad */}
        <View style={localStyles.sectionCard}>
          <Text style={localStyles.sectionTitle}>Seguridad</Text>
          <View>
            <TouchableOpacity 
              style={localStyles.menuItem}
              onPress={() => Alert.alert('Próximamente', '...')}
            >
              <MaterialCommunityIcons name="lock-reset" size={20} color={theme.colors.text} />
              <Text style={localStyles.menuItemText}>Cambiar contraseña</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[localStyles.menuItem, localStyles.settingRowBorder]}
              onPress={() => Alert.alert('Próximamente', '...')}
            >
              <MaterialCommunityIcons name="cellphone-link" size={20} color={theme.colors.text} />
              <Text style={localStyles.menuItemText}>Gestionar dispositivos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Herramientas de Desarrollo */}
        <View style={[localStyles.sectionCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={localStyles.sectionTitle}>Herramientas de Desarrollo</Text>
          <View>
            <TouchableOpacity 
              style={localStyles.menuItem}
              onPress={handleAddTestBalance}
            >
              <MaterialCommunityIcons name="plus-circle" size={20} color={theme.colors.success} />
              <Text style={localStyles.menuItemTextSuccess}>Agregar saldo de prueba (S/ 1000)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[localStyles.menuItem, localStyles.settingRowBorder]}
              onPress={handleResetBalance}
            >
              <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.error} />
              <Text style={localStyles.menuItemTextDestructive}>Reiniciar saldo a S/ 0</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Información de la Cuenta */}
        <View style={localStyles.sectionCard}>
          <Text style={localStyles.sectionTitle}>Información de la Cuenta</Text>
          <View>
            <View style={localStyles.detailRow}>
              <Text style={globalStyles.caption}>Fecha de registro</Text>
              <Text style={globalStyles.body}>
                {userData?.fechaRegistro ? new Date(userData.fechaRegistro).toLocaleDateString('es-ES') : 'N/A'}
              </Text>
            </View>

            <View style={[localStyles.detailRow, localStyles.settingRowBorder]}>
              <Text style={globalStyles.caption}>Última actualización</Text>
              <Text style={globalStyles.body}>
                {userData?.ultimaActualizacion ? new Date(userData.ultimaActualizacion).toLocaleDateString('es-ES') : 'N/A'}
              </Text>
            </View>

            <View style={[localStyles.detailRow, localStyles.settingRowBorder]}>
              <Text style={globalStyles.caption}>Estado de verificación</Text>
              <Text style={user?.emailVerified ? localStyles.statusVerified : localStyles.statusPending}>
                {user?.emailVerified ? 'Verificado' : 'Pendiente'}
              </Text>
            </View>
          </View>
        </View>

        {/* Cerrar Sesión */}
        <View>
          <TouchableOpacity 
            style={localStyles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={20} color={theme.colors.onPrimary} />
            <Text style={localStyles.logoutButtonText}>
              Cerrar Sesión
            </Text>
          </TouchableOpacity>

          <Text style={localStyles.versionText}>
            Versión 1.0.0 • Khipu App
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}