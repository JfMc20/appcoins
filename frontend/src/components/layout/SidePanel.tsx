import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Pathnames from '../../router/pathnames';
import { 
  FaHome, 
  FaUsers, 
  FaGamepad, 
  FaHistory, 
  FaPlus, 
  FaChevronLeft, 
  FaChevronRight,
  FaCoins
} from 'react-icons/fa';

// Definir la estructura de un ítem de navegación
interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  roles?: ('admin' | 'operator')[];
}

// Agrupar los ítems de navegación por secciones
interface NavSection {
  title: string;
  items: NavItem[];
  roles?: ('admin' | 'operator')[];
}

const navSections: NavSection[] = [
  {
    title: 'General',
    items: [
      { title: 'Dashboard', path: Pathnames.home, icon: <FaHome /> },
    ]
  },
  {
    title: 'Administración',
    roles: ['admin'],
    items: [
      { title: 'Usuarios', path: Pathnames.admin.users, icon: <FaUsers /> },
      { title: 'Juegos', path: Pathnames.admin.games.root, icon: <FaGamepad /> },
    ]
  },
  {
    title: 'Transacciones',
    items: [
      { title: 'Historial', path: '/transactions', icon: <FaHistory /> },
      { title: 'Nueva Transacción', path: '/transactions/new', icon: <FaPlus /> },
    ]
  },
];

const SidePanel: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Función para verificar si una ruta está activa
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div 
      className={`h-screen bg-gray-800 text-white transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 flex justify-between items-center">
        {!isCollapsed && (
          <div className="flex items-center">
            <FaCoins className="text-yellow-500 text-2xl mr-2" />
            <h1 className="font-bold text-xl">AppCoins</h1>
          </div>
        )}
        {isCollapsed && <FaCoins className="text-yellow-500 text-xl mx-auto" />}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white"
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      <div className="mt-6">
        {navSections.map((section, idx) => {
          // Solo mostrar secciones permitidas para el rol del usuario
          if (section.roles && user?.role && !section.roles.includes(user.role)) {
            return null;
          }

          return (
            <div key={idx} className="mb-6">
              {!isCollapsed && (
                <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-4 mb-2">
                  {section.title}
                </h2>
              )}
              <ul>
                {section.items.map((item, itemIdx) => {
                  // Solo mostrar ítems permitidos para el rol del usuario
                  if (item.roles && user?.role && !item.roles.includes(user.role)) {
                    return null;
                  }

                  return (
                    <li key={itemIdx}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-2 text-sm hover:bg-gray-700 ${
                          isActive(item.path) ? 'bg-gray-700 font-medium' : ''
                        }`}
                      >
                        <span className={`text-lg ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
                          {item.icon}
                        </span>
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SidePanel; 