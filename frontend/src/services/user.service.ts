import api from './api';
import { User } from '../types/auth.types';
import {
  CreateUserData,
  UpdateUserData,
  UserResponse,
  UsersListResponse,
  UserSearchFilters
} from '../types/user.types';

const ADMIN_USERS_PATH = '/admin/users';
const USERS_PATH = '/users';

// Obtener el perfil del usuario actual
const getCurrentUser = (): Promise<User> => {
  return api.get(`${USERS_PATH}/profile`)
    .then(res => res.data);
};

// Obtener todos los usuarios (solo admin)
const getAllUsers = (): Promise<User[]> => {
  return api.get<UsersListResponse>(ADMIN_USERS_PATH)
    .then(res => res.data.data || res.data);
};

// Obtener un usuario por ID (solo admin)
const getUserById = (id: string): Promise<User> => {
  return api.get<UserResponse>(`${ADMIN_USERS_PATH}/${id}`)
    .then(res => res.data.data || res.data);
};

// Crear un nuevo usuario (solo admin)
const createUser = (userData: CreateUserData): Promise<User> => {
  return api.post<UserResponse>(ADMIN_USERS_PATH, userData)
    .then(res => res.data.data || res.data);
};

// Actualizar un usuario (solo admin)
const updateUser = (id: string, userData: UpdateUserData): Promise<User> => {
  return api.put<UserResponse>(`${ADMIN_USERS_PATH}/${id}`, userData)
    .then(res => res.data.data || res.data);
};

// Eliminar un usuario (solo admin)
const deleteUser = (id: string): Promise<void> => {
  return api.delete(`${ADMIN_USERS_PATH}/${id}`);
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
  const url = queryString ? `${ADMIN_USERS_PATH}/search?${queryString}` : `${ADMIN_USERS_PATH}/search`;
  
  return api.get<UsersListResponse>(url)
    .then(res => res.data.data || res.data);
};

// Actualizar el perfil del usuario actual
const updateProfile = (userData: Partial<User>): Promise<User> => {
  return api.put<UserResponse>(`${USERS_PATH}/profile`, userData)
    .then(res => res.data.data || res.data);
};

// Cambiar contraseña del usuario actual
const changePassword = (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
  return api.post(`${USERS_PATH}/change-password`, { 
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