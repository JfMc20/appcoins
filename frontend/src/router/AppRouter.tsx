import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage'; // Crearemos esta página simple pronto
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/common';

// Definimos las props para ProtectedRoute
interface ProtectedRouteProps {
  children: React.JSX.Element; // Esperamos un elemento JSX como hijo
}

// Componente para rutas protegidas
// Especificamos que retorna React.JSX.Element o null
const ProtectedRoute = ({ children }: ProtectedRouteProps): React.JSX.Element | null => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando autenticación...</div>; // O un spinner/loader
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth(); // Para la lógica de redirección inicial

  if (isLoading) {
    return <div>Cargando...</div>; // Evita renderizar rutas antes de saber el estado de auth
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
          
          {/* Ruta principal protegida */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* Aquí se añadirían más rutas protegidas, por ejemplo:
          <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
          */}

          {/* Ruta de fallback o página 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default AppRouter; 