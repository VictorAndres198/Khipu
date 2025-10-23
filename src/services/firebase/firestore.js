import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './config';

//* ===== USUARIOS =====

/**
 * Obtener un usuario por ID
 */
export const getUser = async (userId) => {
  try {
    const userDoc = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      return {
        id: userSnapshot.id,
        ...userSnapshot.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    throw error;
  }
};

/**
 * Crear o actualizar usuario
 */
export const setUser = async (userId, userData) => {
  try {
    const userDoc = doc(db, 'users', userId);
    
    // ✅ PRIMERO intentamos obtener el documento para ver si existe
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      // Si existe, actualizamos
      await updateDoc(userDoc, userData);
      console.log('✅ Usuario actualizado en Firestore');
    } else {
      // Si no existe, lo creamos
      await setDoc(userDoc, userData);
      console.log('✅ Usuario creado en Firestore');
    }
  } catch (error) {
    console.error('❌ Error guardando usuario:', error);
    throw error;
  }
};

/**
 * Actualizar saldo de usuario
 */
export const updateUserBalance = async (userId, newBalance) => {
  try {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, {
      saldo: newBalance,
      ultimaActualizacion: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error actualizando saldo:', error);
    throw error;
  }
};

//* ===== TRANSACCIONES =====

/**
 * Obtener transacciones de un usuario
 */
export const getUserTransactions = async (userId) => {
  try {
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef, 
      where('usuarioId', '==', userId),
      orderBy('fecha', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo transacciones:', error);
    throw error;
  }
};

/**
 * Crear nueva transacción
 */
export const createTransaction = async (transactionData) => {
  try {
    const transactionsRef = collection(db, 'transactions');
    const docRef = await addDoc(transactionsRef, {
      ...transactionData,
      fecha: new Date().toISOString(),
      estado: 'completado'
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creando transacción:', error);
    throw error;
  }
};

/**
 * Obtener una transacción específica por ID
 */
export const getTransactionById = async (transactionId) => {
  try {
    const transactionDoc = doc(db, 'transactions', transactionId);
    const transactionSnapshot = await getDoc(transactionDoc);
    
    if (transactionSnapshot.exists()) {
      return {
        id: transactionSnapshot.id,
        ...transactionSnapshot.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo transacción:', error);
    throw error;
  }
};

/**
 * Escuchar transacciones en tiempo real con manejo de errores mejorado
 */
export const listenToUserTransactions = (userId, callback) => {
  try {
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef, 
      where('usuarioId', '==', userId),
      orderBy('fecha', 'desc')
    );
    
    return onSnapshot(q, 
      (snapshot) => {
        const transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(transactions);
      },
      (error) => {
        console.error('Error en listener de transacciones:', error);
        // En caso de error de índice, intentar sin ordenar
        if (error.code === 'failed-precondition') {
          console.log('Intentando cargar transacciones sin ordenar...');
          const simpleQuery = query(
            transactionsRef, 
            where('usuarioId', '==', userId)
          );
          onSnapshot(simpleQuery, (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            callback(transactions);
          });
        } else {
          callback([]);
        }
      }
    );
  } catch (error) {
    console.error('Error configurando listener:', error);
    // Retornar función vacía para unsubscribe
    return () => {};
  }
};

// ===== BÚSQUEDA =====

/**
 * Buscar usuario por teléfono
 */
export const findUserByPhone = async (phoneNumber) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('telefono', '==', phoneNumber));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error buscando usuario:', error);
    throw error;
  }
};

//* ===== TRANSFERENCIAS =====

/**
 * Enviar dinero a otro usuario (MEJORADA)
 */
export const sendMoney = async (fromUserId, toPhoneNumber, amount, description = 'Transferencia') => {
  try {
    // 1. Validaciones básicas
    if (amount <= 0) {
      throw new Error('El monto debe ser mayor a cero');
    }

    // 2. Buscar usuario destino
    const toUser = await findUserByPhone(toPhoneNumber);
    if (!toUser) {
      throw new Error('Usuario no encontrado');
    }

    // 3. Verificar que no sea el mismo usuario
    if (fromUserId === toUser.id) {
      throw new Error('No puedes enviarte dinero a ti mismo');
    }

    // 4. Obtener usuario origen y validar saldo
    const fromUser = await getUser(fromUserId);
    if (!fromUser) {
      throw new Error('Usuario origen no encontrado');
    }
    
    if (fromUser.saldo < amount) {
      throw new Error('Saldo insuficiente');
    }

    // 5. ACTUALIZAR SALDOS de forma atómica (esto es importante)
    const newFromBalance = fromUser.saldo - amount;
    const newToBalance = (toUser.saldo || 0) + amount;

    // Usar transacción para asegurar consistencia
    await updateUserBalance(fromUserId, newFromBalance);
    await updateUserBalance(toUser.id, newToBalance);

    // 6. CREAR TRANSACCIONES para ambos usuarios
    const transactionDate = new Date().toISOString();
    
    // Transacción de ENVÍO para el que envía
    await createTransaction({
      usuarioId: fromUserId,
      tipo: 'envio',
      monto: -amount,
      descripcion: description,
      destinatario: toUser.id,
      destinatarioNombre: toUser.nombre,
      destinatarioTelefono: toUser.telefono,
      fecha: transactionDate,
      estado: 'completado',
      categoria: 'transferencia'
    });

    // Transacción de RECEPCIÓN para el que recibe
    await createTransaction({
      usuarioId: toUser.id,
      tipo: 'recepcion',
      monto: amount,
      descripcion: `Transferencia de ${fromUser.nombre}`,
      remitente: fromUserId,
      remitenteNombre: fromUser.nombre,
      remitenteTelefono: fromUser.telefono,
      fecha: transactionDate,
      estado: 'completado',
      categoria: 'transferencia'
    });

    return {
      success: true,
      newBalance: newFromBalance,
      recipientName: toUser.nombre,
      transactionId: `${fromUserId}_${toUser.id}_${Date.now()}`
    };

  } catch (error) {
    console.error('Error enviando dinero:', error);
    throw error;
  }
};

/**
 * Recargar saldo (para pruebas)
 */
export const rechargeBalance = async (userId, amount) => {
  try {
    const user = await getUser(userId);
    
    // ✅ AGREGAR ESTA VALIDACIÓN
    if (!user) {
      throw new Error('Usuario no encontrado en la base de datos');
    }
    
    const currentBalance = user.saldo || 0; // Por si saldo es undefined
    const newBalance = currentBalance + amount;

    await updateUserBalance(userId, newBalance);

    await createTransaction({
      usuarioId: userId,
      tipo: 'recarga',
      monto: amount,
      descripcion: 'Recarga de saldo',
      categoria: 'recarga'
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error('Error recargando saldo:', error);
    throw error;
  }
};
/**
 * Escuchar cambios en usuario en tiempo real
 */
export const listenToUser = (userId, callback) => {
  const userDoc = doc(db, 'users', userId);
  return onSnapshot(userDoc, (docSnapshot) => {
    if (docSnapshot.exists()) {
      callback({
        id: docSnapshot.id,
        ...docSnapshot.data()
      });
    } else {
      callback(null);
    }
  });
};

