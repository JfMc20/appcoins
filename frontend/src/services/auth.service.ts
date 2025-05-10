import axios from 'axios'
import type {
  LoginCredentials,
  RegisterData,
  LoginResponse,
  RegisterResponse,
  RegistrationStatusResponse,
} from '../types/auth.types'

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/auth`

const register = (userData: RegisterData): Promise<RegisterResponse> => {
  // El backend espera que la contraseña se envíe en el campo 'password'.
  // Y la asigna internamente a passwordHash para que el hook pre-save la hashee.
  return axios.post<RegisterResponse>(`${API_URL}/register`, userData).then((res) => res.data)
}

const login = (credentials: LoginCredentials): Promise<LoginResponse> => {
  return axios.post<LoginResponse>(`${API_URL}/login`, credentials).then((response) => {
    if (response.data.token) {
      localStorage.setItem('userToken', JSON.stringify(response.data.token))
    }
    return response.data
  })
}

const logout = (): void => {
  localStorage.removeItem('userToken')
  // Opcional: llamar a un endpoint de logout en el backend
}

const getCurrentUserToken = (): string | null => {
  const tokenString = localStorage.getItem('userToken')
  return tokenString ? JSON.parse(tokenString) : null
}

const getRegistrationStatus = (): Promise<RegistrationStatusResponse> => {
  return axios.get<RegistrationStatusResponse>(`${API_URL}/registration-status`).then((res) => res.data)
}

const authService = {
  register,
  login,
  logout,
  getCurrentUserToken,
  getRegistrationStatus,
}

export default authService
