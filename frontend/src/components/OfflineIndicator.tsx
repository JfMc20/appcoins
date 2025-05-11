import React, { useState, useEffect } from 'react';
import { toggleOfflineMode } from '../services/api';

const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  useEffect(() => {
    const offlineMode = localStorage.getItem('OFFLINE_MODE') === 'true';
    setIsOffline(offlineMode);
  }, []);
  
  const handleToggleOffline = () => {
    toggleOfflineMode(!isOffline);
  };
  
  if (!isOffline) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showOptions ? (
        <div className="bg-orange-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-orange-800 dark:text-orange-300">Modo Offline Activo</h3>
            <button 
              onClick={() => setShowOptions(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Estás trabajando con datos simulados. El backend no está siendo utilizado.
          </p>
          <button
            onClick={handleToggleOffline}
            className="w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Desactivar Modo Offline
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowOptions(true)}
          className="bg-orange-500 text-white px-3 py-2 rounded-full shadow-lg hover:bg-orange-600 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Offline
        </button>
      )}
    </div>
  );
};

export default OfflineIndicator; 