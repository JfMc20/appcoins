import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserLoginData, UserRegistrationData, AuthResponse, loginUser as apiLogin, registerUser as apiRegister, setAuthToken } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Omit<AuthResponse, 'token'> | null;
  token: string | null;
  login: (data: UserLoginData) => Promise<void>;
  register: (data: UserRegistrationData) => Promise<void>; // Asumimos que el registro también loguea o provee token
  logout: () => void;
  isLoading: boolean;
  error: any | null; // Para errores de autenticación
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Omit<AuthResponse, 'token'> | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState<boolean>(false); // Podría ser true inicialmente para cargar el estado
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    // Intentar cargar el usuario si hay un token al iniciar la app
    // Aquí podrías tener una función para validar el token y obtener datos del usuario (ej. /api/auth/me)
    // Por ahora, si hay token, asumimos que es válido y lo configuramos en axios.
    // Una implementación más robusta verificaría el token con el backend.
    if (token) {
      setAuthToken(token);
      // Simulación: Si tuvieras datos del usuario en localStorage también:
      // const storedUser = localStorage.getItem('authUser');
      // if (storedUser) setUser(JSON.parse(storedUser));
      // Idealmente, aquí llamarías a un endpoint /api/auth/me para obtener datos del usuario con el token.
      // Por simplicidad, este ejemplo no lo incluye pero es RECOMENDADO.
    } else {
      setAuthToken(null);
    }
  }, [token]);

  const login = async (data: UserLoginData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiLogin(data);
      const { token: authToken, ...userData } = response;
      localStorage.setItem('authToken', authToken);
      // localStorage.setItem('authUser', JSON.stringify(userData)); // Opcional
      setTokenState(authToken);
      setUser(userData);
      setAuthToken(authToken); // Configurar token en axios
    } catch (err) {
      setError(err);
      setAuthToken(null); // Asegurar que no haya token en axios si falla el login
      throw err; // Relanzar para que el componente de UI lo maneje
    }
    setIsLoading(false);
  };

  const register = async (data: UserRegistrationData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Asumimos que el backend, si el registro es exitoso, devuelve algo similar a AuthResponse
      // incluyendo el token, o que el flujo es registrar y luego hacer login.
      // Si registerUser de authService no devuelve token, este flujo necesita ajuste.
      const response = await apiRegister(data);
      // Si el registro en el backend NO devuelve un token, necesitarás llamar a login() aquí o pedir al usuario que lo haga.
      // Asumiendo por ahora que SÍ devuelve un token (o que authService.registerUser fue ajustado)
      const { token: authToken, ...userData } = response; 
      localStorage.setItem('authToken', authToken);
      setTokenState(authToken);
      setUser(userData);
      setAuthToken(authToken);
    } catch (err) {
      setError(err);
      setAuthToken(null);
      throw err;
    }
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    // localStorage.removeItem('authUser');
    setUser(null);
    setTokenState(null);
    setAuthToken(null); // Limpiar token de axios
    setError(null);
    // Aquí podrías redirigir al login, ej. window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, user, token, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 