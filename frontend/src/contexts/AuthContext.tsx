import type React from 'react'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import authService from '../services/auth.service'
import type { User, LoginCredentials, RegisterData, LoginResponse } from '../types/auth.types'
import axios from 'axios'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  loginUser: (credentials: LoginCredentials) => Promise<void>
  registerUser: (userData: RegisterData) => Promise<void>
  logoutUser: () => void
  forceUserRole: (role: 'admin' | 'operator') => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true, // Empezar como true para verificar el token almacenado
    error: null,
  })

  // Función para actualizar todas las cabeceras de autenticación
  const updateAuthHeaders = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      console.log('Cabeceras de autenticación actualizadas con el token')
    } else {
      delete axios.defaults.headers.common['Authorization']
      console.log('Cabeceras de autenticación eliminadas')
    }
  }

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const token = authService.getCurrentUserToken()
        const user = authService.getCurrentUser()
        
        if (token) {
          updateAuthHeaders(token)
          
          if (user) {
            console.log('Usuario cargado desde localStorage:', user)
            setAuthState({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            console.warn('Token encontrado pero sin datos de usuario válidos')
            setAuthState({
              user: null,
              token,
              isAuthenticated: true, // Mantenemos autenticado pero sin usuario
              isLoading: false,
              error: 'Datos de usuario incompletos',
            })
          }
        } else {
          console.log('No se encontró token de autenticación')
          setAuthState((prev) => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('Error cargando datos de autenticación:', error)
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Error cargando datos de sesión',
        })
      }
    }
    
    loadUserFromStorage()
  }, [])

  const loginUser = async (credentials: LoginCredentials) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const data: LoginResponse = await authService.login(credentials)
      if (!data.token) {
        throw new Error('El servidor no devolvió un token de autenticación')
      }
      
      updateAuthHeaders(data.token)
      
      // Verificar si tenemos los datos de usuario
      if (!data.user) {
        throw new Error('El servidor no devolvió datos de usuario')
      }
      
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al iniciar sesión'
      console.error('Error de login:', errorMessage)
      
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        user: null,
        token: null,
      }))
      
      // Limpiar cualquier dato de autenticación parcial
      authService.logout()
      updateAuthHeaders(null)
      
      throw new Error(errorMessage)
    }
  }

  const registerUser = async (userData: RegisterData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const result = await authService.register(userData)
      console.log('Usuario registrado correctamente:', result)
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al registrar usuario'
      console.error('Error de registro:', errorMessage)
      setAuthState((prev) => ({ ...prev, isLoading: false, error: errorMessage }))
      throw new Error(errorMessage)
    }
  }

  const logoutUser = () => {
    authService.logout()
    updateAuthHeaders(null)
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  }

  // Función para forzar un cambio de rol (solo para desarrollo/depuración)
  const forceUserRole = (role: 'admin' | 'operator') => {
    if (!authState.user) {
      console.error('No hay usuario para actualizar el rol')
      return
    }
    
    try {
      const updatedUser = { ...authState.user, role }
      localStorage.setItem('userObject', JSON.stringify(updatedUser))
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }))
      
      console.log(`Rol actualizado a "${role}" correctamente`)
    } catch (error) {
      console.error('Error al forzar cambio de rol:', error)
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        ...authState, 
        loginUser, 
        registerUser, 
        logoutUser,
        forceUserRole
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider')
  }
  return context
}
