import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage'; // Crearemos esta página simple pronto
import UserManagementPage from '../pages/admin/UserManagementPage'; // Importar la nueva página
import { useAuth } from '../contexts/AuthContext';
import { Layout, LoadingSpinner } from '../components/common';

// Definimos las props para ProtectedRoute
interface ProtectedRouteProps {
  children: React.JSX.Element; // Esperamos un elemento JSX como hijo
  requireAdmin?: boolean; // Nueva prop para rutas que requieren ser admin
}

// Componente para rutas protegidas
// Especificamos que retorna React.JSX.Element o null
const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps): React.JSX.Element | null => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Verificando autenticación..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificación adicional para rutas de administración
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth(); // Para la lógica de redirección inicial

  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" message="Cargando aplicación..." />;
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

          {/* Rutas de administración */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <UserManagementPage />
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