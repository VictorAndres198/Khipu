// ./styles/themes.js

// --- Paleta de Colores Minimalista ---
const palette = {
  // Acento principal (Moderno, Fintech)
  primary: '#00C896',        // Verde Menta Vibrante
  primaryDark: '#00A37A',    // Para presionar
  primaryLight: '#66E0C4',   // Para gradientes
  
  // Funcionales
  success: '#28A745',        // Verde éxito
  error: '#DC3545',          // Rojo error
  warning: '#FFC107',        // Amarillo warning
  
  // Neutros (La base 'Blanco y Negro')
  white: '#FFFFFF',
  black: '#1A1A1A',          // Un 'casi-negro' más suave
  
  // Grises (Light)
  grey100: '#F9F9F9',         // Fondo de superficie (tarjetas)
  grey200: '#F0F0F0',         // Deshabilitado / Variante de superficie
  grey300: '#EAEAEA',         // Bordes / Outlines
  grey500: '#777777',         // Texto secundario
  
  // Grises (Dark)
  dark100: '#121212',         // Fondo (Negro puro)
  dark200: '#1E1E1E',         // Superficie (Tarjetas)
  dark300: '#2A2A2A',         // Variante de superficie
  dark400: '#383838',         // Bordes / Outlines
  dark500: '#AAAAAA',         // Texto secundario
};

// --- Tipografía ---
// 'System' es la opción más minimalista (usa la fuente nativa).
// Si quieres más "estilo", considera usar "Inter" o "Poppins".
// Dejaré 'System' por ahora.
const typography = {
  fontFamily: {
    regular: 'Inter-Regular', // 👈
    medium: 'Inter-Medium',   // 👈
    bold: 'Inter-Bold',       // 👈
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
};

// --- Espaciado (Tu 4-point grid system es perfecto) ---
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// --- Bordes (Están perfectos) ---
const borderRadius = {
  sm: 4,
  md: 8,       // Ideal para inputs y botones
  lg: 12,      // Ideal para tarjetas
  xl: 16,
  round: 9999, // Para avatares o 'pills'
};

// --- Sombras Minimalistas ---
const shadows = {
  light: {
    sm: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, // 👈 Muy sutil
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1, // 👈 Sutil
      shadowRadius: 4,
      elevation: 3,
    },
  },
  dark: {
    // En modo oscuro, las sombras son casi inexistentes.
    // A menudo se reemplazan por bordes más claros o elevación de color.
    // Las dejaremos muy sutiles, pero la elevación de color (surface) es lo principal.
    sm: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
  }
};


// --- TEMA CLARO (LIGHT) ---
export const lightTheme = {
  colors: {
    primary: palette.primary,
    primaryDark: palette.primaryDark,
    primaryLight: palette.primaryLight,
    
    // El secundario ahora es un gris, para un look B&W
    secondary: palette.grey200, 
    secondaryDark: palette.grey300,
    secondaryLight: palette.grey100,
    
    // Funcionales
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: '#17A2B8', // (Podemos mantener un azul info)
    
    // Neutros
    background: palette.white,    // Fondo blanco puro
    surface: palette.grey100,     // Tarjetas casi blancas
    surfaceVariant: palette.grey200,
    outline: palette.grey300,
    
    // Texto
    text: palette.black,          // Texto 'casi-negro'
    textSecondary: palette.grey500, // Texto gris medio
    textTertiary: palette.grey300,  // (Placeholder en dark)
    
    // Texto sobre colores
    onPrimary: palette.white,     // Texto en botón primario
    onSecondary: palette.black,   // Texto en botón secundario (gris)
    
    // Estados
    disabled: palette.grey200,
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  typography,
  spacing,
  borderRadius,
  shadows: shadows.light,
};

// --- TEMA OSCURO (DARK) ---
export const darkTheme = {
  colors: {
    primary: palette.primary,
    primaryDark: palette.primaryDark,
    primaryLight: palette.primaryLight,
    
    // El secundario es un gris oscuro
    secondary: palette.dark300,
    secondaryDark: palette.dark400,
    secondaryLight: palette.dark200,
    
    // Funcionales
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: '#17A2B8',
    
    // Neutros
    background: palette.dark100,     // Fondo 'casi-negro'
    surface: palette.dark200,        // Tarjetas un poco más claras
    surfaceVariant: palette.dark300,
    outline: palette.dark400,
    
    // Texto
    text: palette.white,             // Texto blanco
    textSecondary: palette.dark500,  // Texto gris claro
    textTertiary: palette.grey500,
    
    // Texto sobre colores
    onPrimary: palette.white,        // Texto en botón primario
    onSecondary: palette.white,      // Texto en botón secundario (gris oscuro)
    
    // Estados
    disabled: palette.dark300,
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
  typography,
  spacing,
  borderRadius,
  shadows: shadows.dark,
};

// Exportamos el tema claro por defecto
export default lightTheme;