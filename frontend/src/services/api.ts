import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config';

// Variable para controlar el modo offline (para desarrollo)
const OFFLINE_MODE = localStorage.getItem('OFFLINE_MODE') === 'true';

console.log('API_BASE_URL configurada:', API_BASE_URL);
console.log('MODO OFFLINE:', OFFLINE_MODE ? 'ACTIVADO' : 'DESACTIVADO');

// Cliente axios centralizado para usar en toda la aplicación
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Aumentar el timeout para dar más tiempo a las respuestas
  timeout: 30000, // Incrementar a 30 segundos
});

// Interceptor para solicitudes
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Si estamos en modo offline, no enviar la solicitud realmente
    if (OFFLINE_MODE) {
      console.log(`[API OFFLINE] Solicitud simulada: ${config.method?.toUpperCase()} ${config.url}`);
      
      // Crear una promesa que nunca se resuelve (para cancelarla después)
      const controller = new AbortController();
      config.signal = controller.signal;
      
      // Abortar inmediatamente para que el interceptor de respuesta pueda simular datos
      setTimeout(() => controller.abort('OFFLINE_MODE'), 100);
    }
    
    // Intentar obtener la X-API-Key desde las variables de entorno
    const apiKey = process.env.REACT_APP_X_API_KEY;

    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
      console.log('[API] Usando X-API-Key desde variable de entorno.');
    } else {
      console.warn('[API] ADVERTENCIA: X-API-Key no configurada en las variables de entorno.');
      // Opcionalmente, podrías lanzar un error aquí o manejar la ausencia de la clave
      // dependiendo de los requisitos de tu aplicación.
      // Por ejemplo: delete config.headers['X-API-Key']; si no quieres enviar la cabecera vacía.
    }
    
    // Obtener el token de autenticación JWT del localStorage si existe
    const tokenString = localStorage.getItem('userToken');
    if (tokenString) {
      const token = JSON.parse(tokenString);
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log de depuración más detallado
    console.log(`[API] Enviando ${config.method?.toUpperCase()} a ${config.baseURL}${config.url}`, {
      headers: config.headers,
      params: config.params,
      data: config.data,
      timeout: config.timeout
    });
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[API] Error en la configuración de la solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respuestas - opcionalmente para manejar errores globales
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API] Respuesta recibida de ${response.config.url}:`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error: unknown) => {
    // Modo offline - simular respuestas para desarrollo
    if (OFFLINE_MODE && axios.isAxiosError(error) && error.message.includes('OFFLINE_MODE')) {
      const config = error.config;
      const url = config?.url || '';
      
      console.log(`[API OFFLINE] Simulando respuesta para: ${config?.method?.toUpperCase()} ${url}`);
      
      // Datos simulados según el endpoint
      let mockData: any = { message: "Respuesta simulada en modo offline" };
      
      // Simular diferentes respuestas según la URL y método
      if (url.includes('/auth/login')) {
        mockData = {
          user: { id: "offline-user-1", name: "Usuario Offline", email: "offline@example.com", role: "admin" },
          token: "fake-jwt-token-for-development-only"
        };
        // Guardar token simulado
        localStorage.setItem('userToken', JSON.stringify(mockData.token));
        localStorage.setItem('userData', JSON.stringify(mockData.user));
      } else if (url.includes('/auth/me') || url.includes('/auth/profile')) {
        mockData = { id: "offline-user-1", name: "Usuario Offline", email: "offline@example.com", role: "admin" };
      }
      
      // Crear una respuesta simulada
      const mockResponse = {
        data: mockData,
        status: 200,
        statusText: 'OK (Simulado)',
        headers: {},
        config: config || {},
      };
      
      console.log('[API OFFLINE] Datos simulados:', mockData);
      
      return Promise.resolve(mockResponse as AxiosResponse);
    }
    
    // Detallar el error según su tipo
    if (axios.isAxiosError(error)) {
      const axiosError: AxiosError = error;
      
      if (axiosError.response) {
        // La solicitud se realizó y el servidor respondió con un código de estado fuera del rango 2xx
        console.error('[API] Error de respuesta:', {
          url: axiosError.config?.url,
          status: axiosError.response.status,
          data: axiosError.response.data,
          headers: axiosError.response.headers
        });
      } else if (axiosError.request) {
        // La solicitud se realizó pero no se recibió respuesta
        console.error('[API] Sin respuesta del servidor:', {
          url: axiosError.config?.url,
          request: axiosError.request
        });
        
        // Si es un error de timeout o CORS, dar un mensaje más específico
        if (axiosError.code === 'ECONNABORTED') {
          console.error('[API] Tiempo de espera agotado. Verifica la conectividad del servidor.');
        } else {
          console.error('[API] Posible error de CORS o servidor no disponible. Verifica la configuración del backend.');
        }
      } else {
        // Algo pasó en la configuración de la petición que desencadenó un error
        console.error('[API] Error de configuración:', axiosError.message);
      }
    } else {
      // Error no de Axios
      console.error('[API] Error no identificado:', error);
    }
    
    return Promise.reject(error);
  }
);

// Función auxiliar para verificar la conectividad con el backend
export const checkApiConnection = async (): Promise<boolean> => {
  // Si estamos en modo offline, devolver true inmediatamente
  if (OFFLINE_MODE) {
    console.log('[API] Modo offline activo, saltando verificación de conectividad');
    return true;
  }
  
  // Rutas a probar en orden
  const routesToTry = [
    `${API_BASE_URL}/auth/ping`, // Ruta específica del API (si existe)
    API_BASE_URL,               // La URL del API directamente
    API_BASE_URL.replace('/api', '') // La raíz del dominio
  ];
  
  console.log('[API] Verificando conectividad con el backend...');
  console.log('[API] URLs a probar:', routesToTry);
  
  // Reducir el tiempo de timeout para cada intento
  const shortTimeout = 10000; // 10 segundos por intento para dar más tiempo al servidor
  
  // Intentar cada ruta hasta encontrar una que responda
  for (const url of routesToTry) {
    try {
      const response = await axios.get(url, { 
        timeout: shortTimeout,
        headers: { 'X-API-Key': 'default-dev-key' }
      });
      console.log(`[API] Conectividad exitosa a ${url}:`, response.status);
      return true;
    } catch (error) {
      console.error(`[API] Error al verificar conectividad a ${url}:`, error);
      // Continuar con la siguiente URL si esta falló
    }
  }
  
  // Si todas las rutas fallaron, retornar false
  console.error('[API] Todas las rutas de conectividad fallaron');
  
  // Sugerir modo offline
  console.log('[API] Sugerencia: Intenta activar el modo offline para trabajar sin conexión');
  
  return false;
};

// Ejecutar verificación de conectividad al cargar
checkApiConnection();

// Función para activar/desactivar el modo offline
export const toggleOfflineMode = (enable?: boolean, skipReload: boolean = false): boolean => {
  const newState = enable !== undefined ? enable : !OFFLINE_MODE;
  localStorage.setItem('OFFLINE_MODE', newState.toString());
  console.log(`[API] Modo offline ${newState ? 'ACTIVADO' : 'DESACTIVADO'}`);
  
  // Recargar la página para aplicar los cambios, a menos que se indique lo contrario
  if (!skipReload) {
    window.location.reload();
  }
  
  return newState;
};

export default api; 