import type React from 'react'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

const LoginDebugger: React.FC = () => {
  const { user, token, loginUser, forceUserRole } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [loginResponse, setLoginResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Detectar la URL base de la API
    const envApiUrl = process.env.REACT_APP_API_BASE_URL
    setApiUrl(envApiUrl || 'http://localhost:3000/api')
  }, [])

  const testLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoginResponse(null)
    setLoading(true)

    try {
      // Usar axios directamente para probar la conexión
      const fullUrl = `${apiUrl}/auth/login`
      console.log(`Probando login en: ${fullUrl}`)

      const response = await axios.post(fullUrl, { email, password })
      setLoginResponse(response.data)

      // Análisis de la respuesta
      if (!response.data) {
        setError('La respuesta no contiene datos')
      } else if (!response.data.token) {
        setError('La respuesta no contiene un token')
      } else if (!response.data.user) {
        setError('La respuesta no contiene datos de usuario')
      } else if (!response.data.user.role) {
        setError('La respuesta no contiene el rol del usuario')
      } else {
        setError(null)
        console.log('Respuesta de login válida:', response.data)
      }
    } catch (err: unknown) {
      console.error('Error en prueba de login:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error desconocido')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRealLogin = async () => {
    try {
      setLoading(true)
      await loginUser({ email, password })
      setError(null)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error desconocido')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForceRole = (role: 'admin' | 'operator') => {
    forceUserRole(role)
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Depurador de Autenticación</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Estado Actual</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-semibold">Token:</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 break-all">
                {token ? `${token.substring(0, 20)}...` : 'No disponible'}
              </p>
            </div>
            <div>
              <p className="font-semibold">Usuario:</p>
              <p className="text-gray-600 dark:text-gray-300">
                {user ? `${user.username} (${user.role})` : 'No disponible'}
              </p>
            </div>
            <div>
              <p className="font-semibold">URL de API:</p>
              <p className="text-gray-600 dark:text-gray-300">{apiUrl}</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleForceRole('admin')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={!user}
            >
              Forzar Rol Admin
            </button>
            <button
              type="button"
              onClick={() => handleForceRole('operator')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              disabled={!user}
            >
              Forzar Rol Operador
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Probar Conexión</h2>
            <form onSubmit={testLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email:
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Contraseña:
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  disabled={loading}
                >
                  {loading ? 'Probando...' : 'Probar Conexión API'}
                </button>

                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={handleRealLogin}
                  disabled={loading}
                >
                  {loading ? 'Iniciando...' : 'Login Real'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Resultado</h2>

            {error && (
              <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <strong>Error:</strong> {error}
              </div>
            )}

            {loginResponse && (
              <div>
                <h3 className="font-bold mb-2">Respuesta:</h3>
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-xs overflow-auto max-h-96">
                  {JSON.stringify(loginResponse, null, 2)}
                </pre>
              </div>
            )}

            {!loginResponse && !error && !loading && (
              <p className="text-gray-500">Ejecuta una prueba para ver los resultados</p>
            )}

            {loading && <p className="text-blue-500">Cargando...</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default LoginDebugger
