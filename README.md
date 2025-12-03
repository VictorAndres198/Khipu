# Khipu - Tu Billetera Digital Simple y Segura, (Microservicios Hub-and-Spoke)

Aplicación móvil de billetera digital desarrollada con React Native y Expo, enfocada en la simplicidad y seguridad para transferencias P2P. Permite a los usuarios gestionar su saldo, enviar y recibir dinero mediante número de teléfono o código QR, y ver su historial de transacciones.

---

## ✨ Características Principales

* **Autenticación Segura:** Registro e inicio de sesión con Firebase Authentication (Email/Contraseña) con persistencia nativa.
* **Gestión de Saldo:** Visualización del saldo actual en tiempo real (Firestore Listener).
* **Transferencias P2P:** Envío de dinero a otros usuarios registrados buscando por número de teléfono.
* **Pago por QR:**
    * **Generación de QR:** Código QR único por usuario (basado en UID de Firebase).
    * **Escaneo de QR:** Escáner integrado para leer QR e iniciar transferencias pre-llenando destinatario.
* **Historial de Transacciones:** Lista detallada y en tiempo real de todas las transacciones (Firestore Listener).
* **Recarga (Simulada):** Opciones para añadir saldo de prueba.
* **Perfil de Usuario:** Visualización/Gestión de datos personales y configuraciones.
* **Tema Claro/Oscuro:** Soporte para modo claro, oscuro y automático (sistema), con persistencia (`AsyncStorage`).
* **Validación Avanzada:** Formularios robustos con validación en tiempo real (`React Hook Form` + `Yup`).
* **Feedback Moderno:** Notificaciones no bloqueantes (`react-native-toast-message`) para confirmaciones y errores.
* **Configuración Segura:** Uso de variables de entorno (`.env`) para credenciales de Firebase.

---

## 🛠️ Tech Stack

* **Frontend:** React Native
* **Framework:** Expo
* **Backend & DB:** Firebase (Authentication, Firestore Realtime Listeners)
* **Navegación:** Expo Router
* **Gestión de Estado (Formularios):** React Hook Form + Yup
* **Generación QR:** `react-native-qrcode-svg`
* **Escaneo QR:** `expo-camera`
* **Componentes UI:** React Native Core, `expo-linear-gradient`, `@expo/vector-icons`
* **Estilos:** StyleSheet + Sistema de Diseño Propio (Hooks `useTheme`, `useGlobalStyles`)
* **Persistencia (Tema y Auth):** `@react-native-async-storage/async-storage`
* **Configuración:** Variables de Entorno (`dotenv` a través de Expo)

---

## 🚀 Instalación y Uso

**Pre-requisitos:**
* Node.js (LTS recomendado)
* npm o yarn
* Expo Go app en tu dispositivo móvil o emulador/simulador.
* Cuenta de Firebase y configuración de un proyecto (Authentication con Email/Password, Firestore Database habilitados).

**Pasos:**

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/VictorAndres198/Khipu.git      
    cd khipu
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno (Firebase):**
    * Crea un archivo llamado `.env` en la **raíz** del proyecto.
    * Añade tus credenciales de Firebase obtenidas desde la consola de Firebase. **Es crucial usar el prefijo `EXPO_PUBLIC_`**:
        ```dotenv
        # Firebase Configuration - EJEMPLO DE COMO CREARLO
        EXPO_PUBLIC_FIREBASE_API_KEY=TU_API_KEY
        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=TU_AUTH_DOMAIN
        EXPO_PUBLIC_FIREBASE_PROJECT_ID=TU_PROJECT_ID
        EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=TU_STORAGE_BUCKET
        EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=TU_SENDER_ID
        EXPO_PUBLIC_FIREBASE_APP_ID=TU_APP_ID
        EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=TU_MEASUREMENT_ID_OPCIONAL
        EXPO_PUBLIC_CENTRAL_API_URL=TU_ID_BASE_DEL_API
        EXPO_PUBLIC_KHIPU_API_KEY=TU_SK_PARA_EL_API_CENTRAL
        ```
    * Reemplaza `TU_...` con tus valores reales.

4.  **Iniciar la aplicación:**
    ```bash
    npx expo start -c
    ```
    * El flag `-c` limpia la caché, importante al añadir `.env`.
    * Escanea el código QR generado con la aplicación Expo Go.

---

## 📁 Estructura del Proyecto (Simplificada)

```
.
├── app/                  # Rutas y pantallas (Expo Router)
│   ├── (app)/            # Layout principal autenticado (Stack)
│   │   ├── (tabs)/       # Layout de pestañas
│   │   │   ├── _layout.js
│   │   │   ├── home.js | wallet.js | profile.js
│   │   ├── _layout.js    # Stack Layout (maneja fondo dinámico)
│   │   ├── my-qr.js      # Pantalla de generar QR
│   │   ├── scanner.js    # Pantalla de escanear QR
│   │   ├── send-money.js # Pantalla de enviar dinero
│   │   └── transactions/ # Pantallas de historial
│   ├── _layout.js        # Layout raíz (ThemeProvider, Toast, Stack inicial)
│   ├── index.js          # Pantalla inicial (Verificación Auth)
│   ├── login.js          # Pantalla de Login
│   └── register.js       # Pantalla de Registro
├── assets/               # Fuentes, imágenes, splash screen
├── components/           # Componentes reutilizables (ej. TabBar)
├── src/                  # Código fuente principal
│   ├── hooks/            # Hooks personalizados
│   ├── services/         # Lógica de negocio (Firebase config, auth, firestore, conexión al Api Central)
│   └── styles/           # Estilos globales y temas
├── .env                  # Variables de entorno (Firebase config) <- NO SUBIR A GIT
├── .gitignore            # Archivos ignorados por Git
├── app.json              # Configuración de Expo
└── package.json          # Dependencias y scripts
```

---

## 🔮 Posibles Mejoras Futuras

* **Feedback Táctil (Haptics):** Añadir vibraciones sutiles (`expo-haptics`).
* **Skeleton Loaders:** Usar placeholders visuales (`react-native-skeleton-placeholder`).
* **Manejo Offline:** Detectar y manejar la falta de conexión (`@react-native-community/netinfo`).
* **Animaciones:** Añadir micro-interacciones (`moti`, `react-native-reanimated`).
* **Notificaciones Push:** Implementar notificaciones reales (`expo-notifications`, Firebase Cloud Messaging).
* **Seguridad Avanzada:** Flujos de cambio de contraseña, 2FA real.
* **Edición de Perfil:** Permitir actualizar datos de usuario.
* **Integración de Pagos Reales:** Conectar con Stripe, Culqi, etc. para recargas/retiros.

---

¡Siéntete libre de contribuir o reportar issues!
