import React, { useEffect, useState } from 'react';
import AppRouter from './router/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import ConnectionError from './components/ConnectionError';
import OfflineIndicator from './components/OfflineIndicator';
import { checkApiConnection, toggleOfflineMode } from './services/api';
import { API_BASE_URL } from './config/api.config';
import './App.css';

// Máximo número de intentos automáticos para evitar bucles
const MAX_CONNECTION_ATTEMPTS = 2;

function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isOfflineMode] = useState(localStorage.getItem('OFFLINE_MODE') === 'true' || true);

  // Inicializar dark mode basado en localStorage o preferencia del sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode') === 'true';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme || (prefersDark && savedTheme === null)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Verificar la conexión al servidor
  useEffect(() => {
    // Si estamos en modo offline, saltamos la verificación
    if (isOfflineMode) {
      setIsConnected(true);
      setChecking(false);
      return;
    }
    
    // Evitar bucles infinitos limitando intentos
    if (connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
      console.log(`[App] Alcanzado el máximo de ${MAX_CONNECTION_ATTEMPTS} intentos. Deteniendo reintentos automáticos.`);
      setChecking(false);
      return;
    }
    
    const checkConnection = async () => {
      setChecking(true);
      console.log(`[App] Intento de conexión #${connectionAttempts + 1} a ${API_BASE_URL}`);
      const connected = await checkApiConnection();
      setIsConnected(connected);
      setChecking(false);
      
      // Si no pudimos conectar y es el primer intento, intentar una vez más automáticamente
      if (!connected && connectionAttempts === 0) {
        console.log('[App] Primer intento fallido, reintentando automáticamente...');
        setTimeout(() => {
          setConnectionAttempts(prev => prev + 1);
        }, 3000);
      }
    };

    checkConnection();
  }, [connectionAttempts, isOfflineMode]);

  // Función para reintentar la conexión
  const handleRetryConnection = () => {
    setChecking(true);
    setConnectionAttempts(prev => prev + 1); // Esto provocará que se ejecute el useEffect
  };
  
  // Función para activar el modo offline directamente
  const handleEnableOfflineMode = () => {
    toggleOfflineMode(true);
  };

  // Mostrar un spinner mientras se verifica la conexión
  if (checking && !isOfflineMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Verificando conexión...</p>
        {connectionAttempts > 0 && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Intento #{connectionAttempts + 1}
          </p>
        )}
        
        {/* Mostrar botón de modo offline después del primer intento fallido */}
        {connectionAttempts >= 1 && (
          <button
            onClick={handleEnableOfflineMode}
            className="mt-4 px-4 py-2 text-white bg-orange-500 rounded hover:bg-orange-600 focus:outline-none"
          >
            Activar Modo Offline
          </button>
        )}
      </div>
    );
  }

  // Mostrar error de conexión si no se puede conectar y no estamos en modo offline
  if (isConnected === false && !isOfflineMode) {
    return <ConnectionError onRetry={handleRetryConnection} />;
  }

  // Mostrar la aplicación normalmente
  return (
    <AuthProvider>
      <AppRouter />
      <OfflineIndicator />
    </AuthProvider>
  );
}

export default App;
