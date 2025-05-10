import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/user.service';
import { User } from '../../types/auth.types';
import { CreateUserData } from '../../types/user.types';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estado del formulario de creación de usuario
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'operator'>('operator');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Cargar usuarios al montar el componente
  useEffect(() => {
    // Verificar si el usuario actual es administrador
    if (!user || user.role !== 'admin') {
      navigate('/'); // Redirigir a la página principal si no es administrador
      return;
    }

    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
      console.error('Error al cargar usuarios:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const userData: CreateUserData = {
        username,
        email,
        password,
        fullName,
        role
      };

      const newUser = await userService.createUser(userData);
      setUsers(prevUsers => [...prevUsers, newUser]);
      setSuccessMessage(`Usuario ${newUser.username} creado con éxito.`);
      
      // Limpiar el formulario
      setUsername('');
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('operator');
      setShowCreateForm(false);
      
      // Recargar la lista de usuarios
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear usuario');
      console.error('Error al crear usuario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && users.length === 0) {
    return <LoadingSpinner fullScreen message="Cargando usuarios..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Usuarios
          </h1>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancelar' : 'Crear nuevo usuario'}
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
          </div>
        )}

        {showCreateForm && (
          <Card className="mb-8 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Crear Nuevo Usuario
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input
                label="Nombre de Usuario"
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              
              <Input
                label="Email"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Contraseña"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Nombre Completo (Opcional)"
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rol
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'operator')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="operator">Operador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  Crear Usuario
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Usuarios del Sistema
          </h2>
          
          {users.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4">No hay usuarios para mostrar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                        {user.fullName && ` (${user.fullName})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`
                          }
                        >
                          {user.role === 'admin' ? 'Administrador' : 'Operador'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${user.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`
                          }
                        >
                          {user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserManagementPage; 