import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './config';
import { setUser } from './firestore';

/**
 * Iniciar sesión con email y contraseña
 */
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

/**
 * Registrar nuevo usuario
 */
export const register = async (email, password, userData) => {
  try {
    console.log('🔸 [DEBUG] Iniciando registro...');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('🔸 [DEBUG] Usuario Auth creado:', user.uid);

    // Actualizar perfil
    await updateProfile(user, {
      displayName: userData.nombre
    });

    console.log('🔸 [DEBUG] Creando usuario en Firestore...');
    
    // Guardar datos adicionales en Firestore
    await setUser(user.uid, {
      ...userData,
      email: email,
      fechaRegistro: new Date().toISOString(),
      saldo: 0
    });

    console.log('✅ [DEBUG] Usuario creado en Firestore exitosamente');
    
    return user;
  } catch (error) {
    console.error('❌ [DEBUG] Error en registro:', error);
    throw error;
  }
};

/**
 * Cerrar sesión
 */
// En tu auth.js, verifica que tengas:
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

/**
 * Observador de estado de autenticación
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Obtener usuario actual
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};