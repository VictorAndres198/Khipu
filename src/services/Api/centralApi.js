// Este archivo es el "conector" entre Khipu y el API Central en Render.

// 1. Configuración de la API
// (URL de servicio en Render)
const API_URL = process.env.EXPO_PUBLIC_CENTRAL_API_URL;

// (Llave secreta de Khipu en la BD de Postgres)
const KHIPU_API_KEY = process.env.EXPO_PUBLIC_KHIPU_API_KEY;

/**
 * Función para manejar las llamadas fetch a la API Central
 */
const apiFetch = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': KHIPU_API_KEY, 
        ...options.headers,
      },
    });

    // Manejar el caso de que la respuesta no sea JSON (ej. error 500 sin JSON)
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // Si no es JSON, lanza el texto del error
      throw new Error(text || "Error desconocido del servidor");
    }

    if (!response.ok) {
      // Si la API devuelve un error JSON (ej. { success: false, message: "..." })
      throw new Error(data.message || `Error ${response.status}`);
    }

    return data; // Devuelve el JSON exitoso

  } catch (err) {
    console.error(`Error en API Central [${options.method || 'GET'} ${endpoint}]:`, err.message);
    // Devuelve un objeto de error estandarizado
    return { success: false, message: err.message };
  }
};

// --- ENDPOINTS ---

/**
 * Endpoint A: Registrar un Usuario en el Hub Central
 * (Se llama DESPUÉS del registro exitoso en Firebase)
 * @param {object} data - { userIdentifier, internalWalletId, userName }
 */
export const registerWalletInHub = (data) => {
  return apiFetch('/api/v1/register-wallet', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Endpoint B: Buscar un Destinatario por su ID Universal (teléfono/DNI)
 * @param {string} identifier - El teléfono o DNI a buscar
 */
export const findWalletsByIdentifier = (identifier) => {
  return apiFetch(`/api/v1/wallets/${identifier}`); // GET por defecto
};

/**
 * Endpoint C: Ejecutar la Transferencia Interoperable
 * @param {object} data - { fromIdentifier, toIdentifier, toAppName, monto, descripcion }
 */
export const transferMoneyCentral = (data) => {
  return apiFetch('/api/v1/transfer', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
