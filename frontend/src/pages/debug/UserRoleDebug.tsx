import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const UserRoleDebug: React.FC = () => {
  const { user, token } = useAuth();
  const [storageInfo, setStorageInfo] = useState<any>(null);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('userToken');
    let parsedToken = null;
    try {
      parsedToken = tokenFromStorage ? JSON.parse(tokenFromStorage) : null;
    } catch (error) {
      console.error("Error parsing token:", error);
    }
    
    setStorageInfo({
      rawToken: tokenFromStorage,
      parsedToken
    });
  }, []);

  const updateUserRole = async () => {
    if (!user?._id) return;
    
    try {
      // Esta función es solo para demostración y solo simula el cambio
      // En un entorno real, esto debería hacerse correctamente en el backend
      const updatedUser = { ...user, role: 'admin' };
      localStorage.setItem('userObject', JSON.stringify(updatedUser));
      
      // Refrescar la página para ver los cambios
      window.location.reload();
    } catch (error) {
      console.error("Error actualizando rol:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Depuración de Usuario</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Información del Usuario</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">ID:</p>
              <p className="text-gray-600 dark:text-gray-300">{user?._id || 'No disponible'}</p>
            </div>
            <div>
              <p className="font-semibold">Nombre de usuario:</p>
              <p className="text-gray-600 dark:text-gray-300">{user?.username || 'No disponible'}</p>
            </div>
            <div>
              <p className="font-semibold">Email:</p>
              <p className="text-gray-600 dark:text-gray-300">{user?.email || 'No disponible'}</p>
            </div>
            <div>
              <p className="font-semibold">Rol:</p>
              <p className="text-gray-600 dark:text-gray-300">{user?.role || 'No disponible'}</p>
            </div>
          </div>
          
          <button 
            onClick={updateUserRole}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Cambiar Rol a Admin (Simulación)
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Información de Autenticación</h2>
          <div>
            <p className="font-semibold">Token en Auth Context:</p>
            <p className="text-gray-600 dark:text-gray-300 break-all">{token || 'No disponible'}</p>
          </div>
          
          <div className="mt-4">
            <p className="font-semibold">Token en localStorage:</p>
            <p className="text-gray-600 dark:text-gray-300 break-all">
              {storageInfo?.rawToken || 'No disponible'}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserRoleDebug; 