import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types/auth.types';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser, isLoading, error } = useAuth();
  const navigate = useNavigate();

  // Usuario de prueba (operador)
  const testUser = {
    email: 'test@test.com',
    password: 'test12345'
  };

  // Credenciales de administrador (no mostrar en producción)
  const adminUser = {
    email: 'admin.secure@appcoins.com',
    password: 'test12345'
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const credentials: LoginCredentials = { email, password };
    try {
      await loginUser(credentials);
      navigate('/'); // Redirigir a la página principal después del login
    } catch (loginError) {
      // El error ya se maneja y almacena en AuthContext, aquí solo evitamos la navegación
      console.error('Error de login en la página:', loginError);
    }
  };

  const handleUseTestUser = () => {
    setEmail(testUser.email);
    setPassword(testUser.password);
  };

  const handleUseAdminUser = () => {
    setEmail(adminUser.email);
    setPassword(adminUser.password);
  };

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Iniciar Sesión
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-4 py-8 sm:px-10 bg-gray-100 dark:bg-gray-800 shadow-lg border border-gray-300 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Contraseña"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Iniciar Sesión
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                  Usar datos de prueba
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Button
                onClick={handleUseTestUser}
                variant="secondary"
                fullWidth
              >
                Usar cuenta de prueba (operador)
              </Button>
            </div>
            
            <div className="mt-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                    Acceso administrativo
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <Button
                  onClick={handleUseAdminUser}
                  variant="secondary"
                  fullWidth
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-300 border-purple-300 dark:border-purple-800"
                >
                  Usar cuenta de administrador
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                  ¿No tienes cuenta?
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-600"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage; 