import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Ajusta la ruta si es diferente
// Sugerencia: Para iconos, puedes instalar una librería como lucide-react: npm install lucide-react
// Luego podrías importar iconos así: import { Home, Users, BarChart2 } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/', icon: null, adminOnly: false }, // Reemplaza null con el componente Icono, ej: <Home size={20} />
  { label: 'Transacciones', path: '/transactions', icon: null, adminOnly: false },
  { label: 'Contactos', path: '/contacts', icon: null, adminOnly: false },
  { label: 'Informes', path: '/reports', icon: null, adminOnly: false },
  { label: 'Fuentes de Fondos', path: '/funding-sources', icon: null, adminOnly: false },
  { label: 'Configuración', path: '/settings', icon: null, adminOnly: true }, // Ejemplo de ítem solo para admin
];

const AppLayout = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  console.log('AppLayout Rendered:', { isAuthenticated, userRole: user?.role, user }); // <--- CONSOLE LOG PRINCIPAL

  const handleLogout = async () => {
    try {
      await logout(); // AuthContext se encarga de limpiar el token y el estado
      navigate('/login'); // Redirigir a login después del logout
    } catch (error) {
      console.error('Error durante el logout:', error);
      // Manejar el error de logout si es necesario (ej. mostrar notificación)
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-100">
      {/* {console.log('Sidebar check:', isAuthenticated)} */}
      {isAuthenticated && (
        <aside className="w-64 bg-gray-800 shadow-xl flex flex-col fixed top-16 left-0 h-[calc(100vh-4rem)] z-30">
          <nav className="flex-grow px-2 py-4 space-y-1">
            {navItems.map((item) => {
              if (item.adminOnly && (!user || user.role !== 'admin')) {
                return null; // No mostrar items de admin si no es admin
              }
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
                    ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                  end={item.path === '/'} // 'end' prop para que '/' no esté activo en sub-rutas
                >
                  {/* item.icon && <span className="mr-3">{item.icon}</span> */}
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          {/* Espacio opcional en la parte inferior de la sidebar */}
        </aside>
      )}

      <div className={`flex flex-col flex-grow ${isAuthenticated ? 'ml-64' : ''} transition-all duration-300 ease-in-out`}>
        <header className="w-full bg-gray-800 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="text-2xl font-bold text-sky-400 hover:text-sky-300 transition-colors">
                AdminCoins
              </Link>
              <nav className="flex items-center space-x-4">
                {/* {console.log('Header Nav check:', { isAuthenticated, userExists: !!user })} */}
                {isAuthenticated && user ? (
                  <>
                    <span className="text-gray-300"><strong className="font-medium text-sky-400">{user.username || user.email}</strong></span>
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Cerrando...' : 'Cerrar Sesión'}
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-sky-400 rounded-md transition-colors"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link 
                      to="/register" 
                      className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet /> {/* Las rutas hijas se renderizarán aquí */}
        </main>
        
        <footer className="w-full bg-gray-800 shadow-top mt-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} AdminCoins. Todos los derechos reservados.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout; 