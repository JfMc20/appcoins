import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const FixUserAdmin: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Intentar recuperar cualquier información existente
    const existingUser = localStorage.getItem('userObject');
    if (existingUser) {
      try {
        const parsed = JSON.parse(existingUser);
        if (parsed._id) setUserId(parsed._id);
        if (parsed.username) setUsername(parsed.username);
        if (parsed.email) setEmail(parsed.email);
        setMessage('Usuario existente cargado del localStorage');
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    }
  }, []);

  const forceAdminRole = () => {
    try {
      // Crear un objeto de usuario administrador y guardarlo en localStorage
      const adminUser = {
        _id: userId || '507f1f77bcf86cd799439011', // ID ficticio si no se proporciona
        username: username || 'admin',
        email: email || 'admin@example.com',
        role: 'admin',
        status: 'active'
      };
      
      localStorage.setItem('userObject', JSON.stringify(adminUser));
      setMessage('¡Usuario administrador creado! Recargando página...');
      
      // Recargar después de un breve retraso
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error setting admin user:', error);
      setMessage('Error al crear usuario: ' + (error as Error).message);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Forzar Usuario Administrador</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Esta herramienta te permite crear manualmente un usuario administrador en el localStorage. 
            Esto es útil cuando el backend no entrega correctamente los datos del usuario pero el token es válido.
          </p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">ID de Usuario:</label>
              <input 
                type="text" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="ID del usuario (opcional)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de Usuario:</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Nombre de usuario"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Email"
              />
            </div>
          </div>
          
          <button 
            onClick={forceAdminRole}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Forzar Rol de Administrador
          </button>
          
          {message && (
            <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-md">
              {message}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FixUserAdmin; 