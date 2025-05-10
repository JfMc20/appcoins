import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SidePanel from './SidePanel';
import Pathnames from '../../router/pathnames';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate(Pathnames.auth.login);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* SidePanel lateral */}
      <SidePanel />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header con información del usuario y logout */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">{user?.username}</span>
                <span className="ml-1 text-xs text-gray-500">
                  ({user?.role === 'admin' ? 'Administrador' : 'Operador'})
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {/* Contenido principal scrollable */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 