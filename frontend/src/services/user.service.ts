import axios from 'axios';
import { User, RegisterData } from '../types/auth.types';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/admin/users';

// Interfaz para las credenciales de creación de usuario por admin
export interface AdminUserCreateData extends RegisterData {
  role?: 'admin' | 'operator';
}

// Función para crear un nuevo usuario (solo para administradores)
const createUser = (userData: AdminUserCreateData): Promise<User> => {
  return axios.post<User>(API_URL, userData).then(res => res.data);
};

// Función para obtener todos los usuarios (solo para administradores)
const getUsers = (): Promise<User[]> => {
  return axios.get<User[]>(API_URL).then(res => res.data);
};

// Función para obtener un usuario por ID (solo para administradores)
const getUserById = (userId: string): Promise<User> => {
  return axios.get<User>(`${API_URL}/${userId}`).then(res => res.data);
};

// Función para actualizar un usuario (solo para administradores)
const updateUser = (userId: string, userData: Partial<AdminUserCreateData>): Promise<User> => {
  return axios.put<User>(`${API_URL}/${userId}`, userData).then(res => res.data);
};

// Función para eliminar un usuario (solo para administradores)
const deleteUser = (userId: string): Promise<void> => {
  return axios.delete(`${API_URL}/${userId}`).then(res => res.data);
};

const userService = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};

export default userService; 