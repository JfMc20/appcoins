// Configuración global de la aplicación

// URL base de la API del backend
// Usar URL completa en desarrollo para evitar problemas de CORS o proxy
const ENV_API_URL = process.env.REACT_APP_API_BASE_URL;
const CUSTOM_API_URL = typeof window !== 'undefined' ? localStorage.getItem('CUSTOM_API_URL') : null;

// Función para validar y formatear la URL de API
const formatApiUrl = (url: string | undefined | null): string => {
  // Primero intentar usar una URL personalizada si existe
  if (CUSTOM_API_URL) {
    console.log('Usando URL de API personalizada desde localStorage:', CUSTOM_API_URL);
    return CUSTOM_API_URL;
  }
  
  if (!url) {
    console.warn('URL de API no definida en variables de entorno, usando URL local por defecto');
    // Usar el puerto original
    return 'http://localhost:3002/api';
  }
  
  // Asegurarse de que la URL termina con /api
  if (!url.endsWith('/api')) {
    if (url.endsWith('/')) {
      return `${url}api`;
    } else {
      return `${url}/api`;
    }
  }
  
  return url;
};

export const API_BASE_URL = formatApiUrl(ENV_API_URL);
console.log('API_BASE_URL formateada:', API_BASE_URL);

// Obtener el dominio base (sin /api) para otras operaciones
export const BASE_DOMAIN = API_BASE_URL.replace(/\/api\/?$/, '');

// Otras configuraciones globales pueden agregarse aquí 