import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// 1. Hooks de la App
import useSafeArea from '../../../src/hooks/useSafeArea';
import { useGlobalStyles } from '../../../src/hooks/useGlobalStyles'; // 👈 Dinámico
import useTheme from '../../../src/hooks/useTheme'; // 👈 Dinámico

// 2. Firebase
import { getTransactionById, getUser } from '../../../src/services/firebase/firestore';

// 3. Componente helper para filas de detalle (Refactorizado)
const DetailRow = React.memo(({ label, value, valueStyle }) => {
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme();

  // Estilos solo para este componente
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    label: {
      ...globalStyles.caption,
      flex: 1,
      marginRight: theme.spacing.md,
    },
    value: {
      ...globalStyles.body,
      flex: 1.5, // Dar más espacio al valor
      textAlign: 'right',
    }
  }), [globalStyles, theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </View>
  );
});


// --- Componente Principal ---
export default function TransactionDetail() {
  const { id } = useLocalSearchParams();
  const { safeAreaInsets } = useSafeArea(true); // 👈 'true' para padding
  const router = useRouter();
  
  // 4. Hooks de estilo y tema
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme();
  
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState(null);

  // 5. Lógica de Datos (con Toast en lugar de Alert)
  useEffect(() => {
    const loadTransaction = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const transactionData = await getTransactionById(id);
        setTransaction(transactionData);

        if (transactionData) {
          if (transactionData.tipo === 'envio' && transactionData.destinatario) {
            const recipient = await getUser(transactionData.destinatario);
            setContactInfo({ type: 'destinatario', name: recipient?.nombre || 'Usuario', phone: recipient?.telefono || 'N/A' });
          } else if (transactionData.tipo === 'recepcion' && transactionData.remitente) {
            const sender = await getUser(transactionData.remitente);
            setContactInfo({ type: 'remitente', name: sender?.nombre || 'Usuario', phone: sender?.telefono || 'N/A' });
          }
        }
      } catch (error) {
        console.error('Error cargando transacción:', error);
        Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar la transacción' });
      } finally {
        setLoading(false);
      }
    };
    loadTransaction();
  }, [id]);

  // 6. Helpers de formato (con theme)
  const getTransactionTypeText = (type) => {
    // ... (sin cambios)
    switch (type) {
      case 'envio': return 'Envío de dinero';
      case 'recepcion': return 'Recepción de dinero';
      case 'recarga': return 'Recarga de saldo';
      default: return 'Transacción';
    }
  };

  const getStatusText = (status) => {
    // ... (sin cambios)
    switch (status) {
      case 'completado': return 'Completado';
      case 'pendiente': return 'Pendiente';
      case 'fallido': return 'Fallido';
      default: return status || 'Completado';
    }
  };

  // 7. Helper de color (ahora usa theme y useCallback)
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completado': return theme.colors.success;
      case 'pendiente': return theme.colors.warning;
      case 'fallido': return theme.colors.error;
      default: return theme.colors.success;
    }
  }, [theme]); // Depende del tema

  // 8. Estilos locales dinámicos
  const localStyles = useMemo(() => StyleSheet.create({
    loadingText: {
      ...globalStyles.body,
      marginTop: theme.spacing.md,
      color: theme.colors.textSecondary,
    },
    // Estado "No Encontrado"
    notFoundContainer: {
      ...globalStyles.loadingContainer, // Reutiliza el centrado
      padding: theme.spacing.md,
    },
    notFoundText: {
      ...globalStyles.body,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
    notFoundButton: {
      ...globalStyles.button,
      marginTop: theme.spacing.lg,
    },
    // Header
    headerContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    // Contenido
    scrollContainer: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    // Tarjeta de Monto
    amountCardBase: {
      ...globalStyles.card,
      alignItems: 'center',
      borderWidth: 1,
    },
    amountCardSuccess: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.success,
    },
    amountCardError: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.error,
    },
    amountTextSuccess: {
      ...globalStyles.title,
      color: theme.colors.success,
      fontSize: theme.typography.fontSize.xxxl,
    },
    amountTextError: {
      ...globalStyles.title,
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.xxxl,
    },
    amountDescription: {
      ...globalStyles.body,
      marginTop: theme.spacing.sm,
    },
    amountType: {
      ...globalStyles.caption,
      marginTop: theme.spacing.xs,
    },
    // Tarjeta de Contacto
    sectionCard: {
      ...globalStyles.card,
      marginTop: theme.spacing.md,
    },
    sectionTitle: {
      ...globalStyles.subtitle,
      marginBottom: theme.spacing.sm,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    contactIconContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.round,
      marginRight: theme.spacing.sm,
    },
    contactDetails: { flex: 1 },
    contactName: { ...globalStyles.body },
    contactPhone: { ...globalStyles.caption },
    // Footer
    footerButton: {
      ...globalStyles.button,
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

  // --- Estado No Encontrado ---
  if (!transaction) {
    return (
      <View style={[globalStyles.container, safeAreaInsets, localStyles.notFoundContainer]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text style={[globalStyles.title, { marginTop: theme.spacing.md }]}>Transacción no encontrada</Text>
        <Text style={localStyles.notFoundText}>
          La transacción que buscas no existe o fue eliminada
        </Text>
        <TouchableOpacity style={{width: '100%'}} onPress={() => router.back()}>
          <LinearGradient
            colors={[theme.colors.primaryLight, theme.colors.primary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={localStyles.notFoundButton}
          >
            <Text style={globalStyles.buttonText}>Volver al historial</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const isPositive = transaction.monto > 0;
  const date = transaction.fecha ? new Date(transaction.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
  const time = transaction.fecha ? new Date(transaction.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const statusStyle = { 
    color: getStatusColor(transaction.estado), 
    fontFamily: theme.typography.fontFamily.medium 
  };
  
  // --- Pantalla Principal ---
  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      {/* Header Fijo */}
      <View style={localStyles.headerContainer}>
        <Text style={globalStyles.title}>Detalle de Transacción</Text>
      </View>
      
      {/* Contenido Scrollable */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={localStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Monto */}
        <View style={[
          localStyles.amountCardBase, 
          isPositive ? localStyles.amountCardSuccess : localStyles.amountCardError
        ]}>
          <Text style={isPositive ? localStyles.amountTextSuccess : localStyles.amountTextError}>
            {isPositive ? '+' : ''}S/ {Math.abs(transaction.monto).toFixed(2)}
          </Text>
          <Text style={localStyles.amountDescription}>
            {transaction.descripcion || getTransactionTypeText(transaction.tipo)}
          </Text>
          <Text style={[
            localStyles.amountType, 
            { color: isPositive ? theme.colors.success : theme.colors.error }
          ]}>
            {getTransactionTypeText(transaction.tipo)}
          </Text>
        </View>

        {/* Información del contacto */}
        {contactInfo && (
          <View style={localStyles.sectionCard}>
            <Text style={localStyles.sectionTitle}>
              {contactInfo.type === 'destinatario' ? 'Destinatario' : 'Remitente'}
            </Text>
            
            <View style={localStyles.contactRow}>
              <View style={localStyles.contactIconContainer}>
                <MaterialCommunityIcons name="account-outline" size={24} color={theme.colors.text} />
              </View>
              <View style={localStyles.contactDetails}>
                <Text style={localStyles.contactName}>{contactInfo.name}</Text>
                <Text style={localStyles.contactPhone}>{contactInfo.phone}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Información detallada */}
        <View style={localStyles.sectionCard}>
          <Text style={localStyles.sectionTitle}>
            Información de la Transacción
          </Text>
          <DetailRow label="Fecha" value={date} />
          <DetailRow label="Hora" value={time} />
          <DetailRow label="Tipo" value={getTransactionTypeText(transaction.tipo)} />
          <DetailRow label="Categoría" value={transaction.categoria || 'General'} />
          <DetailRow 
            label="Estado" 
            value={getStatusText(transaction.estado)} 
            valueStyle={statusStyle}
          />
          <DetailRow label="ID de transacción" value={transaction.id} />
        </View>

      </ScrollView>

      {/* Footer Fijo */}
      <View style={globalStyles.footerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <LinearGradient
            colors={[theme.colors.primaryLight, theme.colors.primary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={localStyles.footerButton}
          >
            <Text style={globalStyles.buttonText}>Volver al historial</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}