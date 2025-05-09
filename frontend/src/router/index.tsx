import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout'; // Crearemos este layout más adelante
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import HomePage from '../pages/HomePage'; // Suponiendo una HomePage genérica por ahora
import TransactionsPage from '../pages/TransactionsPage';
import ContactsPage from '../pages/ContactsPage';
import ReportsPage from '../pages/ReportsPage';
import FundingSourcesPage from '../pages/FundingSourcesPage';
import SettingsPage from '../pages/SettingsPage';
// import DashboardPage from '../pages/DashboardPage'; // Para rutas protegidas
// import ProtectedRoute from './ProtectedRoute'; // Para proteger rutas

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    // errorElement: <ErrorPage />,
    children: [
      {
        index: true, // Ruta raíz dentro del layout
        element: <HomePage />,
      },
      {
        path: 'transactions',
        element: <TransactionsPage />,
      },
      {
        path: 'contacts',
        element: <ContactsPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'funding-sources',
        element: <FundingSourcesPage />,
      },
      {
        path: 'settings',
        // element: <ProtectedRoute role='admin'><SettingsPage /></ProtectedRoute>, // Ejemplo de ruta protegida
        element: <SettingsPage />, // Temporalmente sin protección para facilitar pruebas iniciales
      },
      // {
      //   path: 'dashboard',
      //   element: (
      //     <ProtectedRoute>
      //       <DashboardPage />
      //     </ProtectedRoute>
      //   ),
      // },
      // Más rutas hijas aquí
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
}; 