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

  // 5. Lógica de Datos (Simplificada)
  useEffect(() => {
    const loadTransaction = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        // Simplemente obtenemos la transacción.
        // Toda la info que necesitamos (nombres, etc.) YA ESTÁ DENTRO de transactionData.
        const transactionData = await getTransactionById(id);
        setTransaction(transactionData);
      } catch (error) {
        console.error('Error cargando transacción:', error);
        Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar la transacción' });
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [id]); // No borres el '[id]'

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
      {/* Monto (Simplificado) */}
        <View style={[
          localStyles.amountCardBase, 
          isPositive ? localStyles.amountCardSuccess : localStyles.amountCardError
        ]}>
          <Text style={isPositive ? localStyles.amountTextSuccess : localStyles.amountTextError}>
            {isPositive ? '+' : ''}S/ {Math.abs(transaction.monto).toFixed(2)}
          </Text>
          
          {/* Muestra la descripción/concepto que guardamos */}
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

      {/* Mostrar si es un ENVÍO (interno o externo) */}
        {transaction.tipo === 'envio' && transaction.destinatarioNombre && (
          <View style={[localStyles.sectionCard, { marginTop: 16 }]}>
            <Text style={localStyles.sectionTitle}>
              Destinatario
            </Text>
            <View style={localStyles.contactRow}>
              <View style={localStyles.contactIconContainer}>
                <MaterialCommunityIcons name="account-arrow-right-outline" size={24} color={theme.colors.text} />
              </View>
              <View style={localStyles.contactDetails}>
                <Text style={localStyles.contactName}>{transaction.destinatarioNombre}</Text>
                {/* Muestra la app destino SI EXISTE (transferencia externa) */}
                {transaction.destinatarioApp && (
                  <Text style={localStyles.contactPhone}>{transaction.destinatarioApp}</Text>
                )}
                {/* Muestra el teléfono SI EXISTE (transferencia interna Khipu-a-Khipu) */}
                {transaction.destinatarioTelefono && (
                  <Text style={localStyles.contactPhone}>{transaction.destinatarioTelefono}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Mostrar si es una RECEPCIÓN (interna o externa) */}
        {transaction.tipo === 'recepcion' && (
          <View style={[localStyles.sectionCard, { marginTop: 16 }]}>
            <Text style={localStyles.sectionTitle}>
              Remitente
            </Text>
            <View style={localStyles.contactRow}>
              <View style={localStyles.contactIconContainer}>
                <MaterialCommunityIcons name="account-arrow-left-outline" size={24} color={theme.colors.text} />
              </View>
              <View style={localStyles.contactDetails}>
                {/* (El 'remitenteNombre' puede fallar si lo pruebas con Postman, como ya descubrimos) */}
                <Text style={localStyles.contactName}>{transaction.remitenteNombre || 'Remitente desconocido'}</Text>
                {/* Muestra la app remitente SI EXISTE (transferencia externa) */}
                {transaction.remitenteApp && (
                  <Text style={localStyles.contactPhone}>{transaction.remitenteApp}</Text>
                )}
                {/* Muestra el teléfono SI EXISTE (transferencia interna Khipu-a-Khipu) */}
                {transaction.remitenteTelefono && (
                  <Text style={localStyles.contactPhone}>{transaction.remitenteTelefono}</Text>
                )}
              </View>
            </View>
          </View>
        )}

      {/* Información detallada (Mejorada) */}
        <View style={[localStyles.sectionCard, { marginTop: 16 }]}>
          <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
            Información de la Transacción
          </Text>
          <DetailRow label="Fecha" value={date} />
          <DetailRow label="Hora" value={time} />
          <DetailRow 
            label="Estado" 
            value={getStatusText(transaction.estado)} 
            valueStyle={statusStyle}
          />
          
          {/* Fila Opcional: Descripción/Concepto */}
          {transaction.descripcion && (
            <DetailRow label="Concepto" value={transaction.descripcion} />
          )}

          {/* Fila Opcional: ID de la App Externa */}
          {transaction.destinatarioApp && (
            <DetailRow label="Aplicación Destino" value={transaction.destinatarioApp} />
          )}

          {/* Fila Opcional: ID del Log Central */}
          {transaction.centralTransactionId && (
            <DetailRow label="ID de Hub Central" value={transaction.centralTransactionId} />
          )}
          
          <DetailRow label="ID de transacción (Khipu)" value={transaction.id} />
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