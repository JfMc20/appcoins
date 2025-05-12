import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/user.service';
import { User } from '../../types/auth.types';
import { CreateUserData } from '../../types/user.types';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common';
import { DashboardLayout } from '../../components/layout';
import Modal from '../../components/common/Modal';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]); // Lista de administradores para asignar
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
  const [assignedTo, setAssignedTo] = useState<string>('');

  // Estado para el modal de edición
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  // Estados para los campos del formulario de edición
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'operator'>('operator');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive' | 'pending_verification'>('active');
  const [editAssignedTo, setEditAssignedTo] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false); // Estado de carga para la actualización

  // Estado para el modal de confirmación de eliminación
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Estado de carga para la eliminación

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
      
      // Filtrar administradores para mostrarlos en el dropdown de asignación
      const adminsList = data.filter(u => u.role === 'admin');
      setAdmins(adminsList);
      
      // Si el usuario actual es admin, pre-seleccionarlo en la lista de asignación
      if (user && user.role === 'admin') {
        setAssignedTo(user._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
      console.error('Error al cargar usuarios:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    // Verificar si el usuario actual es administrador
    if (!user || user.role !== 'admin') {
      navigate('/'); // Redirigir a la página principal si no es administrador
      return;
    }

    fetchUsers();
  }, [user, navigate, fetchUsers]);

  // Efecto para poblar el formulario de edición cuando editingUser cambia
  useEffect(() => {
    if (editingUser) {
      setEditUsername(editingUser.username);
      setEditEmail(editingUser.email);
      setEditFullName(editingUser.fullName || '');
      setEditRole(editingUser.role);
      setEditStatus(editingUser.status || 'active');
      setEditAssignedTo(editingUser.assignedTo || '');
    }
  }, [editingUser]);

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
      
      // Si es un operador, asignar al admin seleccionado
      if (role === 'operator' && assignedTo) {
        userData.assignedTo = assignedTo;
      }

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

  // Función para manejar la actualización del usuario
  const handleUpdateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return; // Seguridad

    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Crear el objeto solo con los datos que queremos actualizar
      // El backend se encargará de la lógica de asignación si cambia el rol
      const updatedData: Partial<User> = {
        email: editEmail,
        fullName: editFullName || undefined, // Enviar undefined si está vacío para que no se guarde como ""
        role: editRole,
        status: editStatus,
        // Si es operador, enviar el admin asignado, si no, asegurar que no se envíe o sea null/undefined
        assignedTo: editRole === 'operator' ? editAssignedTo : undefined, 
      };

      const updatedUser = await userService.updateUser(editingUser._id, updatedData);
      
      // Actualizar la lista local de usuarios
      setUsers(prevUsers => 
        prevUsers.map(u => u._id === updatedUser._id ? updatedUser : u)
      );
      
      setSuccessMessage(`Usuario ${updatedUser.username} actualizado con éxito.`);
      setShowEditModal(false); // Cerrar el modal
      setEditingUser(null); // Limpiar el usuario en edición

    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar usuario');
      console.error('Error al actualizar usuario:', err);
      // No cerramos el modal en caso de error para que el usuario pueda corregir
    } finally {
      setIsUpdating(false);
    }
  };

  // Función para manejar la eliminación del usuario
  const handleDeleteUser = async () => {
    if (!deletingUser) return; // Seguridad

    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await userService.deleteUser(deletingUser._id);
      
      // Eliminar el usuario de la lista local
      setUsers(prevUsers => prevUsers.filter(u => u._id !== deletingUser._id));
      
      setSuccessMessage(`Usuario ${deletingUser.username} eliminado con éxito.`);
      setShowDeleteConfirmModal(false); // Cerrar el modal
      setDeletingUser(null); // Limpiar el usuario en eliminación

    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
      console.error('Error al eliminar usuario:', err);
      // Mantenemos el modal abierto en caso de error si queremos
      // setShowDeleteConfirmModal(false); 
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Cargando usuarios..." />
      </DashboardLayout>
    );
  }

  // Función para obtener el nombre del administrador asignado
  const getAssignedAdminName = (userId: string): string => {
    const admin = admins.find(a => a._id === userId);
    return admin ? (admin.fullName || admin.username) : 'No asignado';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
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

              {/* Selector de administrador asignado - solo visible si el rol es operador */}
              {role === 'operator' && admins.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Asignar a Administrador
                  </label>
                  <select
                    id="assignedTo"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Seleccionar Administrador</option>
                    {admins.map(admin => (
                      <option key={admin._id} value={admin._id}>
                        {admin.fullName || admin.username}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Asignado a
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((userEntry) => (
                    <tr key={userEntry._id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {userEntry.username}
                        {userEntry.fullName && ` (${userEntry.fullName})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {userEntry.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${userEntry.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`
                          }
                        >
                          {userEntry.role === 'admin' ? 'Administrador' : 'Operador'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${userEntry.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`
                          }
                        >
                          {userEntry.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {userEntry.role === 'operator' && userEntry.assignedTo ?
                          getAssignedAdminName(userEntry.assignedTo) :
                          <span className="text-gray-400 dark:text-gray-600">N/A</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(userEntry);
                            setShowEditModal(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setDeletingUser(userEntry);
                            setShowDeleteConfirmModal(true);
                          }}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {showEditModal && editingUser && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Editar Usuario: ${editingUser.username}`}
        >
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <Input
              label="Nombre de Usuario (No editable)"
              id="editUsername"
              type="text"
              value={editUsername}
              disabled
              readOnly
            />
            <Input
              label="Email"
              id="editEmail"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
            <Input
              label="Nombre Completo (Opcional)"
              id="editFullName"
              type="text"
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rol
              </label>
              <select
                id="editRole"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as 'admin' | 'operator')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="operator">Operador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                id="editStatus"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as 'active' | 'inactive' | 'pending_verification')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            {/* Selector de administrador asignado - solo visible si el rol es operador */}
            {editRole === 'operator' && admins.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Asignar a Administrador
                </label>
                <select
                  id="editAssignedTo"
                  value={editAssignedTo}
                  onChange={(e) => setEditAssignedTo(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Seleccionar Administrador</option>
                  {admins.map(admin => (
                    <option key={admin._id} value={admin._id}>
                      {admin.fullName || admin.username}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdating}
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {showDeleteConfirmModal && deletingUser && (
        <Modal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
          title={`Eliminar Usuario: ${deletingUser.username}`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeleteConfirmModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isDeleting}
              onClick={handleDeleteUser}
            >
              Eliminar Usuario
            </Button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default UserManagementPage; 