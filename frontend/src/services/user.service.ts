import axios from 'axios';
import { User } from '../types/auth.types';
import {
  CreateUserData,
  UpdateUserData,
  UserResponse,
  UsersListResponse,
  UserSearchFilters
} from '../types/user.types';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/admin/users`;

// Obtener el perfil del usuario actual
const getCurrentUser = (): Promise<User> => {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/profile`)
    .then(res => res.data);
};

// Obtener todos los usuarios (solo admin)
const getAllUsers = (): Promise<User[]> => {
  return axios.get<UsersListResponse>(API_URL)
    .then(res => res.data.data || res.data);
};

// Obtener un usuario por ID (solo admin)
const getUserById = (id: string): Promise<User> => {
  return axios.get<UserResponse>(`${API_URL}/${id}`)
    .then(res => res.data.data || res.data);
};

// Crear un nuevo usuario (solo admin)
const createUser = (userData: CreateUserData): Promise<User> => {
  return axios.post<UserResponse>(API_URL, userData)
    .then(res => res.data.data || res.data);
};

// Actualizar un usuario (solo admin)
const updateUser = (id: string, userData: UpdateUserData): Promise<User> => {
  return axios.put<UserResponse>(`${API_URL}/${id}`, userData)
    .then(res => res.data.data || res.data);
};

// Eliminar un usuario (solo admin)
const deleteUser = (id: string): Promise<void> => {
  return axios.delete(`${API_URL}/${id}`);
};

// Buscar usuarios con filtros (solo admin)
const searchUsers = (filters: UserSearchFilters): Promise<User[]> => {
  // Construir querystring de filtros
  const queryParams = new URLSearchParams();
  
  if (filters.username) queryParams.append('username', filters.username);
  if (filters.email) queryParams.append('email', filters.email);
  if (filters.role && filters.role !== 'all') queryParams.append('role', filters.role);
  if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
  
  const queryString = queryParams.toString();
  const url = queryString ? `${API_URL}/search?${queryString}` : `${API_URL}/search`;
  
  return axios.get<UsersListResponse>(url)
    .then(res => res.data.data || res.data);
};

// Actualizar el perfil del usuario actual
const updateProfile = (userData: Partial<User>): Promise<User> => {
  return axios.put<UserResponse>(`${process.env.REACT_APP_API_BASE_URL}/users/profile`, userData)
    .then(res => res.data.data || res.data);
};

// Cambiar contraseña del usuario actual
const changePassword = (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
  return axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/change-password`, { 
    currentPassword, 
    newPassword 
  }).then(res => res.data);
};

const userService = {
  getCurrentUser,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  updateProfile,
  changePassword
};

export default userService; 