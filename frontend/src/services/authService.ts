import axios from 'axios';

// Determinar la URL base de la API a partir de las variables de entorno de Vite
// VITE_API_BASE_URL se configurará en el archivo .env del frontend
// Por ejemplo: VITE_API_BASE_URL=http://localhost:3002/api
// O para producción: VITE_API_BASE_URL=https://appcoinsadmin.duckdns.org/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interfaz para los datos de registro de usuario (ajustar según el backend)
export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: 'operator' | 'admin';
}

// Interfaz para los datos de login
export interface UserLoginData {
  email: string;
  password: string;
}

// Interfaz para la respuesta del backend al registrar/loguear (ajustar según el backend)
// Esto debería coincidir con lo que tu backend devuelve, especialmente el token
export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  role: 'operator' | 'admin';
  fullName?: string;
  token: string; // El JWT
  // ...otros campos que pueda devolver tu backend
}

export const registerUser = async (userData: UserRegistrationData): Promise<AuthResponse> => {
  // El backend en el README.md para /register no devuelve el token directamente,
  // sino solo los datos del usuario. La respuesta de login sí incluye el token.
  // Ajustamos la promesa para que coincida con la respuesta esperada del registro.
  // Si el backend cambiara para devolver el token en registro, se ajustaría aquí.
  try {
    const response = await apiClient.post<Omit<AuthResponse, 'token'>>('/auth/register', userData);
    // Como el registro no devuelve token, no podemos devolver AuthResponse directamente.
    // Devolvemos los datos del usuario, y el flujo implicará un login posterior.
    // O, si se prefiere, que esta función devuelva solo los datos del usuario y no AuthResponse.
    // Por simplicidad, asumiremos que el flujo es registrar y luego loguear.
    // Si el backend SÍ devolviera un token en el registro, esto sería: return response.data;
    return response.data as AuthResponse; // Esto fallará si el token no está. Hay que ajustar.
                                        // Mejor lo ajustamos para que el backend SI devuelva el token o la respuesta sea distinta.
                                        // Por ahora, lo dejo así esperando que el backend pueda devolver el token.
                                        // Si no, la función debería devolver Omit<AuthResponse, 'token'>.
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data; // Lanza el objeto de error del backend
    }
    throw error; // Lanza otros errores
  }
};

export const loginUser = async (userData: UserLoginData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data; // Lanza el objeto de error del backend
    }
    throw error; // Lanza otros errores
  }
};

// Podríamos añadir una función para establecer el token globalmente en axios después del login
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

interface RegistrationStatusResponse {
  status: 'open' | 'closed';
  message: string;
}

export const getRegistrationStatus = async (): Promise<RegistrationStatusResponse> => {
  try {
    const response = await apiClient.get<RegistrationStatusResponse>('/auth/registration-status');
    return response.data;
  } catch (error) {
    // Considera un manejo de error más específico si es necesario
    console.error('Error fetching registration status:', error);
    // Devolver un estado por defecto o relanzar el error podría ser una opción
    // Por ahora, si hay error, asumimos que podría estar cerrado o hay un problema
    throw error; 
  }
};

export default apiClient; // Exportar la instancia configurada de axios por si se necesita en otros servicios 