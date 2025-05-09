import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/auth.service';
import { User, LoginCredentials, RegisterData, LoginResponse } from '../types/auth.types';
import axios from 'axios';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  loginUser: (credentials: LoginCredentials) => Promise<void>;
  registerUser: (userData: RegisterData) => Promise<void>;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true, // Empezar como true para verificar el token almacenado
    error: null,
  });

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const token = authService.getCurrentUserToken();
      if (token) {
        // Aquí idealmente validarías el token con el backend o decodificarías para obtener datos del usuario
        // Por ahora, asumimos que si hay token, está "autenticado" y seteamos datos básicos.
        // Deberíamos tener una forma de obtener el usuario completo a partir del token.
        // Temporalmente, si hay token, intentaremos simular que tenemos un usuario (esto necesita mejora)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Simulación: si tienes un endpoint /me o /profile, úsalo aquí.
        // Como no lo tenemos definido explícitamente, por ahora solo seteamos el token
        // y dejamos `user` como null hasta que el login lo popule.
        // O, si el token JWT contiene la información del usuario, decodifícala.
        // Por simplicidad, vamos a requerir un login para obtener datos del usuario completos.
        setAuthState({
          user: null, // Se obtendrá en el login
          token: token,
          isAuthenticated: true, // Si hay token, asumimos autenticado para proteger rutas
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };
    loadUserFromStorage();
  }, []);

  const loginUser = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data: LoginResponse = await authService.login(credentials);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      // El servicio ya guarda el token en localStorage
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al iniciar sesión';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage, isAuthenticated: false, user: null, token: null }));
      localStorage.removeItem('userToken'); // Limpiar token si el login falla
      delete axios.defaults.headers.common['Authorization'];
      throw new Error(errorMessage);
    }
  };

  const registerUser = async (userData: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // El servicio de registro actual no devuelve un token, solo datos del usuario.
      // El usuario necesitará hacer login después de registrarse.
      await authService.register(userData);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      // No cambiamos isAuthenticated aquí, el usuario debe hacer login
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al registrar usuario';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const logoutUser = () => {
    authService.logout(); // Limpia el token de localStorage
    delete axios.defaults.headers.common['Authorization'];
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, loginUser, registerUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}; 