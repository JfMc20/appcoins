import type React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { DashboardLayout } from '../components/layout'
import Card from '../components/common/Card'

const HomePage: React.FC = () => {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-center my-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ¡Bienvenido, {user?.fullName || user?.username}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Panel de administración de AppCoins</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjeta de resumen rápido */}
          <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Resumen</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Acceso rápido a tus estadísticas y actividad reciente.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Transacciones</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Juegos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
            </div>
          </Card>

          {/* Tarjeta de acciones rápidas */}
          <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Acciones Rápidas</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Accede directamente a las acciones más comunes.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="flex-grow py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
              >
                Nueva Transacción
              </button>
              {user?.role === 'admin' && (
                <button
                  type="button"
                  className="flex-grow py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm"
                >
                  Crear Usuario
                </button>
              )}
            </div>
          </Card>

          {/* Tarjeta de ayuda */}
          <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ayuda</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">¿Necesitas ayuda para usar el sistema?</p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>Usa el menú lateral para navegar</li>
              <li>Consulta la documentación</li>
              <li>Contacta al administrador si tienes problemas</li>
            </ul>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default HomePage
