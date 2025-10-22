export const lightTheme = {
  // Colores principales
  colors: {
    primary: '#2E86AB',       // Azul principal de Khipu
    primaryDark: '#1B5E7A',   // Azul oscuro
    primaryLight: '#5DA8D3',  // Azul claro
    
    secondary: '#A23B72',     // Rosa/ magenta secundario
    secondaryDark: '#7A2B56', // Rosa oscuro
    secondaryLight: '#C55F95', // Rosa claro
    
    // Colores funcionales
    success: '#4CAF50',       // Verde
    warning: '#FFC107',       // Amarillo
    error: '#F44336',         // Rojo
    info: '#2196F3',          // Azul info
    
    // Escala de grises
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceVariant: '#E9ECEF',
    outline: '#DEE2E6',
    
    // Texto
    text: '#212529',
    textSecondary: '#6C757D',
    textTertiary: '#ADB5BD',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    
    // Estados
    disabled: '#E9ECEF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Tipografía
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    lineHeight: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 36,
    },
  },
  
  // Espaciado
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },
  
  // Sombras
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
  },
};

// Tema oscuro (para el futuro)
export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
  },
};

export default lightTheme;