import type React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import HomePage from '../pages/HomePage' // Crearemos esta página simple pronto
import UserManagementPage from '../pages/admin/UserManagementPage' // Importar la nueva página
import GameManagementPage from '../pages/admin/games/GameManagementPage' // Importar página de gestión de juegos
import GameItemsPage from '../pages/admin/games/GameItemsPage' // Importar página de gestión de ítems de juegos
import ExchangeRatePage from '../pages/admin/ExchangeRatePage' // Importar página de tasas de cambio
import TransactionHistoryPage from '../pages/transactions/TransactionHistoryPage' // Importar página de historial de transacciones
import NewTransactionPage from '../pages/transactions/NewTransactionPage' // Importar página de nueva transacción
import FundingSourcesListPage from '../pages/funding/FundingSourcesListPage' // Nueva página
import CreateFundingSourcePage from '../pages/funding/CreateFundingSourcePage' // <-- Importar nueva página
import UserRoleDebug from '../pages/debug/UserRoleDebug'
import FixUserAdmin from '../pages/debug/FixUserAdmin' // Nueva página para forzar usuario admin
import LoginDebugger from '../pages/debug/LoginDebugger' // Depurador de login
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common'
import { SecretTools } from '../components/common'
import Pathnames from './pathnames'

// Definimos las props para ProtectedRoute
interface ProtectedRouteProps {
  children: React.JSX.Element // Esperamos un elemento JSX como hijo
  requireAdmin?: boolean // Nueva prop para rutas que requieren ser admin
}

// Componente para rutas protegidas
// Especificamos que retorna React.JSX.Element o null
const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps): React.JSX.Element | null => {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <LoadingSpinner message="Verificando autenticación..." />
  }

  if (!isAuthenticated) {
    return <Navigate to={Pathnames.auth.login} replace />
  }

  // Verificación adicional para rutas de administración
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to={Pathnames.home} replace />
  }

  return children
}

const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth() // Para la lógica de redirección inicial

  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" message="Cargando aplicación..." />
  }

  return (
    <Router>
      <SecretTools />
      <Routes>
        <Route
          path={Pathnames.auth.login}
          element={isAuthenticated ? <Navigate to={Pathnames.home} replace /> : <LoginPage />}
        />
        <Route
          path={Pathnames.auth.register}
          element={isAuthenticated ? <Navigate to={Pathnames.home} replace /> : <RegisterPage />}
        />

        {/* Ruta principal protegida */}
        <Route
          path={Pathnames.home}
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Rutas de administración de usuarios */}
        <Route
          path={Pathnames.admin.users}
          element={
            <ProtectedRoute requireAdmin={true}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Rutas de administración de juegos */}
        <Route
          path={Pathnames.admin.games.root}
          element={
            <ProtectedRoute requireAdmin={true}>
              <GameManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={Pathnames.admin.games.items}
          element={
            <ProtectedRoute requireAdmin={true}>
              <GameItemsPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta de tasas de cambio */}
        <Route
          path={Pathnames.admin.exchangeRates}
          element={
            <ProtectedRoute requireAdmin={true}>
              <ExchangeRatePage />
            </ProtectedRoute>
          }
        />

        {/* Rutas de transacciones */}
        <Route
          path={Pathnames.transactions.history}
          element={
            <ProtectedRoute>
              <TransactionHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={Pathnames.transactions.new}
          element={
            <ProtectedRoute>
              <NewTransactionPage />
            </ProtectedRoute>
          }
        />

        {/* Rutas de Fuentes de Fondos */}
        <Route
          path={Pathnames.funding.list}
          element={
            <ProtectedRoute>
              <FundingSourcesListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={Pathnames.funding.new} // <-- Nueva ruta
          element={
            <ProtectedRoute>
              <CreateFundingSourcePage />
            </ProtectedRoute>
          }
        />

        {/* Rutas de depuración */}
        <Route
          path={Pathnames.debug.userRole}
          element={
            <ProtectedRoute requireAdmin={true}>
              <UserRoleDebug />
            </ProtectedRoute>
          }
        />

        <Route
          path={Pathnames.debug.fixAdmin}
          element={
            <ProtectedRoute requireAdmin={true}>
              <FixUserAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path={Pathnames.debug.loginDebug}
          element={
            <ProtectedRoute requireAdmin={true}>
              <LoginDebugger />
            </ProtectedRoute>
          }
        />

        {/* Nuevas rutas ocultas (seguras) para herramientas de diagnóstico */}
        <Route
          path={Pathnames.secureTools.userRole}
          element={
            <ProtectedRoute requireAdmin={true}>
              <UserRoleDebug />
            </ProtectedRoute>
          }
        />

        <Route
          path={Pathnames.secureTools.fixAdmin}
          element={
            <ProtectedRoute requireAdmin={true}>
              <FixUserAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path={Pathnames.secureTools.loginDebug}
          element={
            <ProtectedRoute requireAdmin={true}>
              <LoginDebugger />
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto - redireccionar a home o login */}
        <Route 
          path="*" 
          element={isAuthenticated ? <Navigate to={Pathnames.home} replace /> : <Navigate to={Pathnames.auth.login} replace />} 
        />
      </Routes>
    </Router>
  )
}

export default AppRouter
