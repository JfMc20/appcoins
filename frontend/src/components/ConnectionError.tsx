import React, { useState } from 'react';
import { API_BASE_URL, BASE_DOMAIN } from '../config';
import { toggleOfflineMode } from '../services/api';

interface ConnectionErrorProps {
  onRetry?: () => void;
}

const ConnectionError: React.FC<ConnectionErrorProps> = ({ onRetry }) => {
  const [showDebug, setShowDebug] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  
  const handleSubmitCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl) {
      localStorage.setItem('CUSTOM_API_URL', customUrl);
      window.location.reload();
    }
  };
  
  const handleEnableOfflineMode = () => {
    toggleOfflineMode(true);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-800">
          <svg className="w-8 h-8 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="mb-4 text-xl font-semibold text-center text-gray-800 dark:text-white">
          Error de conexión
        </h1>
        <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
          No se puede conectar con el servidor. Por favor verifica tu conexión a internet y que el servidor esté en funcionamiento.
        </p>
        
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Reintentar conexión
          </button>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            {showDebug ? 'Ocultar detalles' : 'Mostrar detalles'}
          </button>
          <button
            onClick={handleEnableOfflineMode}
            className="px-4 py-2 text-white bg-orange-500 rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          >
            Modo Offline
          </button>
        </div>
        
        {showDebug && (
          <div className="mt-4">
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-700 dark:text-gray-300 overflow-auto">
              <p>API URL: {API_BASE_URL}</p>
              <p>Base Domain: {BASE_DOMAIN}</p>
              <p>User Agent: {navigator.userAgent}</p>
            </div>
            
            <div className="mt-4 border-t pt-4 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Configurar URL personalizada</h3>
              <form onSubmit={handleSubmitCustomUrl}>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="http://localhost:3002/api"
                  className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                >
                  Guardar y recargar
                </button>
              </form>
              
              <div className="mt-4 pt-3 border-t dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modo Offline</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  El modo offline te permite usar la aplicación sin conexión al backend, usando datos simulados. Útil para desarrollo y pruebas.
                </p>
                <button
                  onClick={handleEnableOfflineMode}
                  className="w-full px-4 py-2 text-white bg-orange-500 rounded hover:bg-orange-600"
                >
                  Activar Modo Offline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionError; 