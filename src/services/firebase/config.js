import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de Firebase
const firebaseConfig = {
apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  // measurementId es opcional para React Native, pero puedes incluirlo si lo usas
  // measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey) {
  console.error("Error: Las variables de entorno de Firebase no están configuradas correctamente. Revisa tu archivo .env y el prefijo EXPO_PUBLIC_");
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// ✅ SOLO PARA WEB - Auth sin AsyncStorage
const db = getFirestore(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth, db };