import { User } from './auth.types';

// Tipos para las respuestas de la API
export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface UsersListResponse {
  success: boolean;
  data: User[];
  message?: string;
}

// Tipo para crear un nuevo usuario (usado por el administrador)
export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: 'admin' | 'operator';
  status?: 'active' | 'inactive' | 'pending_verification';
  assignedTo?: string; // ID del administrador asignado
}

// Tipo para actualizar un usuario existente
export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  fullName?: string;
  role?: 'admin' | 'operator';
  status?: 'active' | 'inactive' | 'pending_verification';
  assignedTo?: string; // ID del administrador asignado
}

// Filtros para búsqueda de usuarios
export interface UserSearchFilters {
  username?: string;
  email?: string;
  role?: 'admin' | 'operator' | 'all';
  status?: 'active' | 'inactive' | 'pending_verification' | 'all';
}

// Tipos adicionales para la gestión de operadores
export interface OperatorStats {
  userId: string;
  transactionsCount: number;
  salesAmount: number;
  lastActivityDate?: Date;
}

export interface OperatorPerformance {
  user: User;
  stats: OperatorStats;
} 