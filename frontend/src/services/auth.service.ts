import api from './api';
import type {
  LoginCredentials,
  RegisterData,
  LoginResponse,
  RegisterResponse,
  RegistrationStatusResponse,
  User
} from '../types/auth.types'

// Definir la URL base de la API desde las variables de entorno
const AUTH_PATH = '/auth';

// Función para depurar respuestas de la API
const debugApiResponse = (action: string, data: any) => {
  console.group(`🔐 Auth API [${action}]`);
  console.log('Data:', data);
  console.groupEnd();
};

const register = (userData: RegisterData): Promise<RegisterResponse> => {
  console.log('Registrando usuario:', userData);
  return api.post<RegisterResponse>(`${AUTH_PATH}/register`, userData)
    .then((res) => {
      debugApiResponse('register', res.data);
      return res.data;
    })
    .catch(error => {
      console.error('Error al registrar:', error.response?.data || error.message);
      throw error;
    });
}

const login = (credentials: LoginCredentials): Promise<LoginResponse> => {
  console.log('Iniciando sesión con:', credentials.email);
  
  return api.post<LoginResponse>(`${AUTH_PATH}/login`, credentials)
    .then((response) => {
      debugApiResponse('login', response.data);
      
      if (response.data.token) {
        // Guardar token
        localStorage.setItem('userToken', JSON.stringify(response.data.token));
        
        // Guardar usuario
        if (response.data.user) {
          // Verificar que el usuario tenga todos los campos necesarios
          const user = response.data.user;
          
          // Si el usuario no tiene un rol asignado, asumir 'operator' por defecto
          if (!user.role) {
            console.warn('Usuario sin rol en la respuesta, asignando "operator" por defecto');
            user.role = 'operator';
          }
          
          console.log('Guardando datos de usuario en localStorage:', user);
          localStorage.setItem('userObject', JSON.stringify(user));
        } else {
          console.error('No se recibieron datos de usuario en la respuesta de login');
        }
      } else {
        console.error('No se recibió token en la respuesta de login');
      }
      
      return response.data;
    })
    .catch(error => {
      console.error('Error de login:', error.response?.data || error.message);
      throw error;
    });
}

const logout = (): void => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userObject');
  console.log('Sesión cerrada y datos eliminados de localStorage');
}

const getCurrentUserToken = (): string | null => {
  try {
    const tokenString = localStorage.getItem('userToken');
    return tokenString ? JSON.parse(tokenString) : null;
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
}

const getCurrentUser = (): User | null => {
  try {
    const userString = localStorage.getItem('userObject');
    const user = userString ? JSON.parse(userString) : null;
    
    // Verificar si tenemos un usuario válido con los campos mínimos necesarios
    if (user && user._id && user.role) {
      return user;
    }
    
    console.warn('Datos de usuario incompletos o no encontrados en localStorage');
    return null;
  } catch (error) {
    console.error('Error al obtener usuario de localStorage:', error);
    return null;
  }
}

const getRegistrationStatus = (): Promise<RegistrationStatusResponse> => {
  return api.get<RegistrationStatusResponse>(`${AUTH_PATH}/registration-status`)
    .then((res) => res.data)
    .catch(error => {
      console.error('Error al verificar estado de registro:', error.response?.data || error.message);
      throw error;
    });
}

const authService = {
  register,
  login,
  logout,
  getCurrentUserToken,
  getCurrentUser,
  getRegistrationStatus,
}

export default authService
