import { StyleSheet } from 'react-native';
import theme from './themes';

export const globalStyles = StyleSheet.create({
  // *Contenedores
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Contenedor con padding horizontal estándar
  containerWithPadding: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
  },
  
  // Contenedor con padding en todos los lados
  containerWithFullPadding: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  
  // Header con padding superior extra
  headerContainer: {
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  headerContainerNoPadding: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    // ← Sin padding horizontal
  },
  
  // Footer con padding inferior extra
  footerContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  
  // Scroll content - para listas
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },


  // *Textos
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xxl,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.xxl,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.xl,
  },
  body: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.md,
  },
  caption: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.sm,
  },
  
  // *Botones
  button: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.onPrimary,
  },
  
  // *Tarjetas
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  
  // *Inputs
  input: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    padding: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },

  buttonTextSecondary: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  },
  
  buttonDisabled: {
    opacity: 0.6,
  },


// Agrega esto a tus globalStyles si no los tienes
center: {
  alignItems: 'center',
  justifyContent: 'center',
},

// Para el estado de carga
loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},

// Para distribución de elementos
row: {
  flexDirection: 'row',
},

spaceBetween: {
  justifyContent: 'space-between',
},
});

export default globalStyles;