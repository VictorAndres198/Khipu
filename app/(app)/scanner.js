import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Camera, CameraView } from 'expo-camera'; 
import { useRouter } from 'expo-router';
import useSafeArea from '../../src/hooks/useSafeArea';
import { useGlobalStyles } from '../../src/hooks/useGlobalStyles';
import useTheme from '../../src/hooks/useTheme';

export default function ScannerScreen() {
  const { safeAreaInsets } = useSafeArea(true);
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme();
  const router = useRouter();

 
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);


  const styles = useMemo(() => StyleSheet.create({
    container: { // Tu contenedor principal
      flex: 1,
      backgroundColor: 'black', // Fondo oscuro
    },
    camera: { // Estilo para CameraView
      flex: 1,
    },
    overlay: { // Contenedor para el marco y texto
      ...StyleSheet.absoluteFillObject, // Cubre toda la pantalla
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanFrame: { // El cuadrado donde debe ir el QR
      width: 250,
      height: 250,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.6)', // Blanco semitransparente
      borderRadius: theme.borderRadius.lg, // Opcional: esquinas redondeadas
      backgroundColor: 'transparent', // Importante
    },
    scanText: { // Texto de instrucción
      ...globalStyles.body,
      color: 'white',
      marginTop: theme.spacing.lg,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente para legibilidad
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    // (Opcional: Si quieres esquinas en lugar de un marco completo)
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: theme.colors.primary, // Verde Khipu
        borderWidth: 4,
    },
    topLeft: { top: -2, left: -2, borderBottomWidth: 0, borderRightWidth: 0 },
    topRight: { top: -2, right: -2, borderBottomWidth: 0, borderLeftWidth: 0 },
    bottomLeft: { bottom: -2, left: -2, borderTopWidth: 0, borderRightWidth: 0 },
    bottomRight: { bottom: -2, right: -2, borderTopWidth: 0, borderLeftWidth: 0 },

  }), [theme, globalStyles]);

  
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);
 
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true); 
    
    // ✅ LÍNEA CORREGIDA
    router.replace({
      pathname: '/(app)/sendMoneyCentral',
      params: { scannedIdentifier: data } // 👈 ¡EL CAMBIO CLAVE!
    });
  };
 
  if (hasPermission === null) {
    return (
      <View style={[globalStyles.loadingContainer, safeAreaInsets]}>
        <Text style={{ ...globalStyles.body, color: theme.colors.textSecondary }}>
          Solicitando permiso de cámara...
        </Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={[globalStyles.loadingContainer, safeAreaInsets]}>
        <Text style={{ ...globalStyles.body, color: theme.colors.textSecondary }}>
          No hay acceso a la cámara.
        </Text>
      </View>
    );
  } 

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        style={styles.camera} // Aplicar estilo flex: 1
      />

      {/* ✅ AÑADIR EL OVERLAY VISUAL */}
      <View style={styles.overlay}>
        {/* Opción A: Marco Simple */}
        {/* <View style={styles.scanFrame} /> */}

        {/* Opción B: Esquinas (Más estilizado) */}
        <View style={{ width: 250, height: 250 }}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <Text style={styles.scanText}>
          Coloca el código QR dentro del marco
        </Text>
      </View>
      {/* Puedes añadir un botón de "Cancelar" aquí si quieres */}
    </View>
  );
}