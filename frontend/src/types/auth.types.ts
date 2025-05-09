// Definiciones de tipos para la autenticación

export interface User {
  _id: string; // Corregido a _id basado en la respuesta del backend
  username: string;
  email: string;
  role: 'admin' | 'operator';
  fullName?: string;
  // cualquier otros campos del usuario que devuelva el backend al hacer login
}

export interface LoginCredentials {
  email: string; // Cambiado de usernameOrEmail a email
  password: string;
}

// UserData para el registro público inicial
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  // role no se envía en el registro público, lo determina el backend
}

// Respuesta del endpoint de login
export interface LoginResponse {
  token: string;
  user: User;
  message?: string; 
}

// Respuesta del endpoint de registro
export interface RegisterResponse {
  // No hay token en la respuesta de registro según el backend
  user: Pick<User, '_id' | 'username' | 'email' | 'role'>; // Solo los campos devueltos
  message?: string;
}

// Respuesta del endpoint de registration-status
export interface RegistrationStatusResponse {
  status: 'open' | 'closed';
  message: string;
} 