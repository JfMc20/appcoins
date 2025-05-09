import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Barra de navegación */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-800 dark:text-white">AppCoins</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a 
                  href="/" 
                  className="border-transparent text-gray-900 dark:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Inicio
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={toggleDarkMode}
                className="ml-3 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              >
                {darkMode ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              {user ? (
                <div className="ml-3 relative">
                  <div>
                    <button 
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <span className="sr-only">Abrir menú de usuario</span>
                      <div className="h-8 w-8 rounded-full bg-gray-700 text-white flex items-center justify-center">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                    </button>
                  </div>
                  {menuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {user.email}
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ml-3 flex items-center">
                  <a
                    href="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    Iniciar sesión
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} AppCoins. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 