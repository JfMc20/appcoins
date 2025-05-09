import React, { useEffect } from 'react';
import AppRouter from './router/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  // Inicializar dark mode basado en localStorage o preferencia del sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode') === 'true';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme || (prefersDark && savedTheme === null)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
