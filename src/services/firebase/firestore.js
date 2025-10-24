import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, // Aunque no la uses aún, es bueno tenerla importada
  query, 
  where, 
  orderBy,
  limit, // Útil para paginación o limitar resultados
  onSnapshot // Para listeners en tiempo real
} from 'firebase/firestore';
import { db } from './config'; // ✅ Importa la instancia 'db' inicializada

//* ===== USUARIOS =====

/**
 * Obtener un usuario por ID
 * @param {string} userId El ID del usuario a buscar
 * @returns {object|null} Objeto con datos del usuario (incluyendo ID) o null si no existe
 */
export const getUser = async (userId) => {
  if (!userId) return null; // Validación básica
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (userSnapshot.exists()) {
      return {
        id: userSnapshot.id,
        ...userSnapshot.data()
      };
    }
    console.log(`Usuario con ID ${userId} no encontrado.`);
    return null;
  } catch (error) {
    console.error(`Error obteniendo usuario ${userId}:`, error);
    throw new Error('No se pudo obtener la información del usuario.');
  }
};

/**
 * Crear o actualizar datos de usuario en Firestore.
 * Usa setDoc con merge: true para simplificar (crea si no existe, actualiza si existe).
 * @param {string} userId ID del usuario
 * @param {object} userData Objeto con los datos a guardar/actualizar
 */
export const setUser = async (userId, userData) => {
  if (!userId) throw new Error("Se requiere ID de usuario.");
  try {
    const userDocRef = doc(db, 'users', userId);
    // setDoc con merge: true es ideal para crear/actualizar
    await setDoc(userDocRef, userData, { merge: true }); 
    console.log(`Datos del usuario ${userId} guardados/actualizados.`);
  } catch (error) {
    console.error(`Error guardando usuario ${userId}:`, error);
    throw new Error('No se pudieron guardar los datos del usuario.');
  }
};

/**
 * Actualizar saldo y fecha de última actualización de un usuario
 * @param {string} userId 
 * @param {number} newBalance 
 */
export const updateUserBalance = async (userId, newBalance) => {
  if (!userId) throw new Error("Se requiere ID de usuario.");
  if (typeof newBalance !== 'number' || newBalance < 0) {
      throw new Error("El nuevo saldo debe ser un número positivo.");
  }
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      saldo: newBalance,
      ultimaActualizacion: new Date().toISOString() // Fecha/hora actual
    });
    console.log(`Saldo del usuario ${userId} actualizado a ${newBalance}.`);
  } catch (error) {
    console.error(`Error actualizando saldo para ${userId}:`, error);
    throw new Error('No se pudo actualizar el saldo.');
  }
};

/**
 * Escuchar cambios en los datos de un usuario en tiempo real
 * @param {string} userId 
 * @param {function} callback Función a ejecutar con los datos del usuario (o null)
 * @returns {function} Función para desuscribirse del listener
 */
export const listenToUser = (userId, callback) => {
  if (!userId) return () => {}; // Devuelve función vacía si no hay ID
  try {
    const userDocRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback({
          id: docSnapshot.id,
          ...docSnapshot.data()
        });
      } else {
        console.log(`Listener: Usuario ${userId} no encontrado.`);
        callback(null);
      }
    }, (error) => { // Manejo de errores del listener
      console.error(`Error en listener de usuario ${userId}:`, error);
      callback(null); // O podrías pasar un objeto de error
    });
    return unsubscribe; // Devuelve la función para detener el listener
  } catch (error) {
     console.error(`Error configurando listener para usuario ${userId}:`, error);
     return () => {}; // Devuelve función vacía en caso de error de setup
  }
};

//* ===== TRANSACCIONES =====

/**
 * Obtener TODAS las transacciones de un usuario (ordenadas por fecha descendente)
 * @param {string} userId 
 * @returns {Array} Array de objetos de transacción
 */
export const getUserTransactions = async (userId) => {
  if (!userId) return [];
  try {
    const transactionsRef = collection(db, 'transactions');
    // Nota: El orderBy('fecha', 'desc') requiere un índice compuesto en Firestore.
    // Si da error, comenta el orderBy o crea el índice en la consola de Firebase.
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
    console.error(`Error obteniendo transacciones para ${userId}:`, error);
    // Si es error de índice, puedes intentar sin ordenar
    if (error.code === 'failed-precondition') {
       console.warn("Índice de Firestore no encontrado para ordenar transacciones. Creálo o la lista no estará ordenada por fecha.");
       // Intenta sin ordenar
       try {
         const simpleQuery = query(collection(db, 'transactions'), where('usuarioId', '==', userId));
         const snapshot = await getDocs(simpleQuery);
         // Ordena en el cliente (menos eficiente para listas grandes)
         return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
           .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
       } catch (innerError) {
         console.error(`Error obteniendo transacciones (sin ordenar) para ${userId}:`, innerError);
         throw new Error('No se pudieron obtener las transacciones.');
       }
    }
    throw new Error('No se pudieron obtener las transacciones.');
  }
};

/**
 * Crear una nueva transacción en Firestore
 * @param {object} transactionData Datos de la transacción (usuarioId, tipo, monto, etc.)
 * @returns {string} ID de la nueva transacción creada
 */
export const createTransaction = async (transactionData) => {
  if (!transactionData || !transactionData.usuarioId) {
      throw new Error("Datos de transacción incompletos (falta usuarioId).");
  }
  try {
    const transactionsRef = collection(db, 'transactions');
    const docData = {
      ...transactionData,
      fecha: transactionData.fecha || new Date().toISOString(), // Usa fecha si existe, si no, la actual
      estado: transactionData.estado || 'completado' // Estado por defecto
    };
    const docRef = await addDoc(transactionsRef, docData);
    console.log(`Transacción creada con ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error creando transacción:', error);
    throw new Error('No se pudo registrar la transacción.');
  }
};

/**
 * Obtener una transacción específica por su ID
 * @param {string} transactionId 
 * @returns {object|null} Objeto de transacción o null
 */
export const getTransactionById = async (transactionId) => {
  if (!transactionId) return null;
  try {
    const transactionDocRef = doc(db, 'transactions', transactionId);
    const transactionSnapshot = await getDoc(transactionDocRef);
    
    if (transactionSnapshot.exists()) {
      return {
        id: transactionSnapshot.id,
        ...transactionSnapshot.data()
      };
    }
    console.log(`Transacción con ID ${transactionId} no encontrada.`);
    return null;
  } catch (error) {
    console.error(`Error obteniendo transacción ${transactionId}:`, error);
    throw new Error('No se pudo obtener el detalle de la transacción.');
  }
};

/**
 * Escuchar cambios en las transacciones de un usuario en tiempo real
 * @param {string} userId 
 * @param {function} callback Función a ejecutar con el array de transacciones
 * @returns {function} Función para desuscribirse
 */
export const listenToUserTransactions = (userId, callback) => {
  if (!userId) return () => {};
  try {
    const transactionsRef = collection(db, 'transactions');
    // Intenta con ordenamiento
    const q = query(
      transactionsRef, 
      where('usuarioId', '==', userId),
      orderBy('fecha', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => { // Éxito
        const transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(transactions);
      },
      (error) => { // Error
        console.error(`Error en listener de transacciones para ${userId}:`, error);
        // Fallback si es error de índice: intenta sin ordenar y ordena en cliente
        if (error.code === 'failed-precondition') {
          console.warn("Índice no encontrado para ordenar listener. Intentando sin ordenar...");
          const simpleQuery = query(collection(db, 'transactions'), where('usuarioId', '==', userId));
          // Importante desuscribirse del listener anterior si existe uno nuevo
          unsubscribe(); // Detiene el listener fallido
          const fallbackUnsubscribe = onSnapshot(simpleQuery, (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
              .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            callback(transactions);
          }, (fallbackError) => {
             console.error(`Error en listener de transacciones (fallback) para ${userId}:`, fallbackError);
             callback([]); // Envía array vacío en caso de error irrecuperable
          });
          // Devolver la función de desuscripción del fallback
          return fallbackUnsubscribe; 
        } else {
          callback([]); // Envía array vacío en otros errores
        }
      }
    );
    return unsubscribe; // Devuelve la función del listener principal (con orderBy)
  } catch (error) {
    console.error(`Error configurando listener de transacciones para ${userId}:`, error);
    return () => {};
  }
};

//* ===== BÚSQUEDA =====

/**
 * Buscar un usuario por su número de teléfono
 * @param {string} phoneNumber 
 * @returns {object|null} Datos del usuario encontrado o null
 */
export const findUserByPhone = async (phoneNumber) => {
  if (!phoneNumber) return null;
  try {
    const usersRef = collection(db, 'users');
    // Asegúrate de tener un índice en Firestore para el campo 'telefono'
    const q = query(usersRef, where('telefono', '==', phoneNumber), limit(1)); 
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }
    console.log(`Usuario con teléfono ${phoneNumber} no encontrado.`);
    return null;
  } catch (error) {
    console.error(`Error buscando usuario por teléfono ${phoneNumber}:`, error);
    throw new Error('No se pudo buscar el usuario por teléfono.');
  }
};

//* ===== TRANSFERENCIAS (SEND MONEY) =====

/**
 * Lógica completa para enviar dinero entre usuarios.
 * Actualiza saldos y crea registros de transacción para ambos.
 * @param {string} fromUserId ID del usuario que envía
 * @param {string} toPhoneNumber Teléfono del usuario que recibe
 * @param {number} amount Monto a enviar
 * @param {string} [description='Transferencia'] Descripción opcional
 * @returns {object} Objeto indicando éxito y datos relevantes
 */
export const sendMoney = async (fromUserId, toPhoneNumber, amount, description = 'Transferencia') => {
  if (!fromUserId || !toPhoneNumber || !amount) {
      throw new Error("Faltan datos para la transferencia (ID origen, teléfono destino, monto).");
  }
  
  // *** INICIO DE ZONA CRÍTICA: Idealmente usar Transacciones de Firestore ***
  // Por simplicidad, lo haremos con updates secuenciales, pero ten en cuenta
  // que una transacción atómica sería más robusta si algo falla a la mitad.
  
  try {
    // 1. Validaciones
    if (amount <= 0) throw new Error('El monto debe ser mayor a cero');

    // 2. Obtener datos de ambos usuarios EN PARALELO
    const [fromUser, toUser] = await Promise.all([
        getUser(fromUserId),
        findUserByPhone(toPhoneNumber)
    ]);

    // 3. Validar existencia y saldos
    if (!fromUser) throw new Error('Usuario origen no válido');
    if (!toUser) throw new Error('Usuario destinatario no encontrado');
    if (fromUserId === toUser.id) throw new Error('No puedes enviarte dinero a ti mismo');
    if ((fromUser.saldo || 0) < amount) throw new Error('Saldo insuficiente');

    // 4. Calcular nuevos saldos
    const newFromBalance = (fromUser.saldo || 0) - amount;
    const newToBalance = (toUser.saldo || 0) + amount;

    // 5. Actualizar saldos (idealmente dentro de una transacción Firestore)
    await updateUserBalance(fromUserId, newFromBalance);
    await updateUserBalance(toUser.id, newToBalance);

    // 6. Crear registros de transacción para ambos
    const transactionDate = new Date().toISOString();
    
    await Promise.all([
      // Registro de GASTO para el remitente
      createTransaction({
        usuarioId: fromUserId,
        tipo: 'envio',
        monto: -amount, // Negativo
        descripcion: description || `Envío a ${toUser.nombre}`,
        destinatarioId: toUser.id, // Guardar ID para referencias futuras
        destinatarioNombre: toUser.nombre,
        destinatarioTelefono: toUser.telefono,
        fecha: transactionDate,
        estado: 'completado',
        categoria: 'transferencia'
      }),
      // Registro de INGRESO para el destinatario
      createTransaction({
        usuarioId: toUser.id,
        tipo: 'recepcion',
        monto: amount, // Positivo
        descripcion: description || `Recibido de ${fromUser.nombre}`,
        remitenteId: fromUserId, // Guardar ID
        remitenteNombre: fromUser.nombre,
        remitenteTelefono: fromUser.telefono, // Puede ser útil
        fecha: transactionDate,
        estado: 'completado',
        categoria: 'transferencia'
      })
    ]);

    console.log(`Transferencia de S/${amount} de ${fromUserId} a ${toUser.id} completada.`);
    
    // Devolver información útil a la UI
    return {
      success: true,
      newBalance: newFromBalance, // El nuevo saldo del remitente
      recipientName: toUser.nombre,
    };

  } catch (error) {
    console.error('Error crítico en sendMoney:', error);
    // *** IMPORTANTE: Aquí deberías implementar lógica de ROLLBACK si estás ***
    // *** usando updates secuenciales y algo falló después de actualizar ***
    // *** el primer saldo. Con Transacciones de Firestore, esto es automático. ***
    throw error; // Relanza el error para que la UI lo maneje (con Toast)
  }
  // *** FIN DE ZONA CRÍTICA ***
};

//* ===== RECARGA (PARA PRUEBAS) =====

/**
 * Añade saldo a un usuario y crea una transacción de recarga.
 * @param {string} userId 
 * @param {number} amount Monto positivo a añadir
 * @returns {object} Objeto indicando éxito y nuevo saldo
 */
export const rechargeBalance = async (userId, amount) => {
  if (!userId || !amount || amount <= 0) {
      throw new Error("Se requiere ID de usuario y un monto positivo para recargar.");
  }
  try {
    const user = await getUser(userId);
    if (!user) throw new Error('Usuario no encontrado para recargar');
    
    const currentBalance = user.saldo || 0;
    const newBalance = currentBalance + amount;

    // Actualiza el saldo
    await updateUserBalance(userId, newBalance);

    // Crea el registro de la transacción
    await createTransaction({
      usuarioId: userId,
      tipo: 'recarga',
      monto: amount, // Positivo
      descripcion: `Recarga de S/ ${amount.toFixed(2)}`,
      categoria: 'recarga',
      estado: 'completado'
    });

    console.log(`Recarga de S/${amount} para ${userId} completada. Nuevo saldo: ${newBalance}`);
    return { success: true, newBalance };
  } catch (error) {
    console.error(`Error recargando saldo para ${userId}:`, error);
    throw error;
  }
};