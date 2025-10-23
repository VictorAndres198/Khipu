import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDRoF8HTpuRuB9OeSUvebQYmmzwQJWbv5c",
  authDomain: "khipu-app-32c60.firebaseapp.com",
  projectId: "khipu-app-32c60",
  storageBucket: "khipu-app-32c60.firebasestorage.app",
  messagingSenderId: "570735434749",
  appId: "1:570735434749:web:cb9a67216aedfd285ad794",
  measurementId: "G-EQK3DZEYPG"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// ✅ SOLO PARA WEB - Auth sin AsyncStorage
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;