import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import useSafeArea from '../../src/hooks/useSafeArea';
import { useGlobalStyles } from '../../src/hooks/useGlobalStyles';
import useTheme from '../../src/hooks/useTheme';
import { getCurrentUser } from '../../src/services/firebase/auth';
import QRCode from 'react-native-qrcode-svg'; 
import { LinearGradient } from 'expo-linear-gradient';

export default function MyQRScreen() {
  const { safeAreaInsets } = useSafeArea(true);
  const router = useRouter();
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme();
  
  const user = getCurrentUser();
  const userUid = user ? user.uid : 'error-no-user';


  const localStyles = useMemo(() => StyleSheet.create({
    container: {
      ...globalStyles.loadingContainer, 
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    title: {
      ...globalStyles.title,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      ...globalStyles.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    qrContainer: {
      backgroundColor: 'white',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.xl,
    },
    footerButton: {
      ...globalStyles.button,
      width: '100%',
    }
  }), [globalStyles, theme]);

  return (
    <View style={[localStyles.container, safeAreaInsets]}>
      <Text style={localStyles.title}>Mi Código QR</Text>
      <Text style={localStyles.subtitle}>
        Muestra este código para recibir dinero al instante.
      </Text>
      
      <View style={localStyles.qrContainer}>
        <QRCode
          value={userUid} 
          size={250}
          logoBackgroundColor="transparent"
        />
      </View>
      
      <TouchableOpacity style={{width: '100%'}} onPress={() => router.back()}>
        <LinearGradient
          colors={[theme.colors.primaryLight, theme.colors.primary]}
          style={localStyles.footerButton}
        >
          <Text style={globalStyles.buttonText}>Cerrar</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}