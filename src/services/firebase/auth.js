import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile // Para actualizar el 'displayName'
} from 'firebase/auth'; // Importa funciones específicas
import { auth } from './config'; // ✅ Importa la instancia 'auth' inicializada
import { setUser } from './firestore'; // Para guardar datos adicionales en Firestore

/**
 * Iniciar sesión con email y contraseña
 */
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error en login:', error.code, error.message); // Log más detallado
    // Puedes personalizar mensajes de error comunes aquí si quieres
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Email o contraseña incorrectos.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('El formato del email no es válido.');
    }
    throw new Error('Ocurrió un error al iniciar sesión.'); // Error genérico
  }
};

/**
 * Registrar nuevo usuario
 */
export const register = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Actualizar perfil de Firebase Auth (opcional pero bueno tenerlo)
    await updateProfile(user, {
      displayName: userData.nombre 
    });

    // Guardar datos adicionales en Firestore
    await setUser(user.uid, {
      nombre: userData.nombre,
      telefono: userData.telefono,
      email: email, // Guardamos el email también en Firestore para búsquedas
      fechaRegistro: new Date().toISOString(),
      saldo: 0, // Saldo inicial
      // Puedes añadir más campos aquí si los necesitas
    });

    return user;
  } catch (error) {
    console.error('Error en registro:', error.code, error.message);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Este email ya está registrado.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('El formato del email no es válido.');
    } else if (error.code === 'auth/weak-password') {
       throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }
    throw new Error('Ocurrió un error al registrar la cuenta.'); // Error genérico
  }
};

/**
 * Cerrar sesión
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error en logout:', error);
    throw error; // Relanzar para que la UI pueda manejarlo si es necesario
  }
};

/**
 * Observador de estado de autenticación
 * @param {function} callback Función que se ejecuta cuando el estado cambia (recibe el objeto 'user' o 'null')
 * @returns {function} Función para desuscribirse del listener
 */
export const onAuthChange = (callback) => {
  // onAuthStateChanged devuelve la función 'unsubscribe'
  return onAuthStateChanged(auth, callback);
};

/**
 * Obtener usuario actual (síncrono)
 * Puede devolver null si el estado de auth aún no está listo.
 * Es mejor usar onAuthChange para reaccionar a los cambios.
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
