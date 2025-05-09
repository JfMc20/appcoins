import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RegisterData, RegistrationStatusResponse } from '../types/auth.types';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { LoadingSpinner } from '../components/common';
import authService from '../services/auth.service';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [showTestUserDetails, setShowTestUserDetails] = useState(false);
  const { registerUser, isLoading, error } = useAuth();
  const navigate = useNavigate();

  // Usuario de prueba actualizado
  const testUser = {
    username: 'testuser',
    email: 'test@testm',
    password: 'test12345',
    fullName: 'Usuario de Prueba'
  };

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response = await authService.getRegistrationStatus();
        setRegistrationStatus(response);
        setStatusLoading(false);
      } catch (err) {
        console.error('Error al verificar el estado del registro:', err);
        setStatusError('No se pudo verificar si el registro está disponible');
        setStatusLoading(false);
      }
    };

    checkRegistrationStatus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setRegistrationSuccess(null);
    const userData: RegisterData = { username, email, password, fullName };
    try {
      await registerUser(userData);
      setRegistrationSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (registerError) {
      console.error('Error de registro en la página:', registerError);
      setRegistrationSuccess(null);
    }
  };

  const handleUseTestUser = () => {
    setUsername(testUser.username);
    setEmail(testUser.email);
    setPassword(testUser.password);
    setFullName(testUser.fullName);
  };

  const toggleTestUserDetails = () => {
    setShowTestUserDetails(!showTestUserDetails);
  };

  if (statusLoading) {
    return <LoadingSpinner fullScreen message="Verificando disponibilidad de registro..." />;
  }

  // Si el registro está cerrado o hay algún error de verificación
  if ((registrationStatus && registrationStatus.status === 'closed') || statusError) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Registro no disponible
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="px-4 py-8 sm:px-10 bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                {statusError || registrationStatus?.message || 'El registro de nuevos usuarios está temporalmente desactivado.'}
              </p>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Puedes utilizar nuestro usuario de prueba para acceder al sistema.
              </p>
              
              <Button
                onClick={toggleTestUserDetails}
                variant="secondary"
                fullWidth
                className="mb-4"
              >
                {showTestUserDetails ? 'Ocultar datos de prueba' : 'Mostrar datos de prueba'}
              </Button>
              
              {showTestUserDetails && (
                <div className="mb-6 bg-gray-200 dark:bg-gray-700 p-4 rounded-md text-left border border-gray-300 dark:border-gray-600">
                  <p className="font-medium text-gray-900 dark:text-white mb-2">Datos de usuario de prueba:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Email: {testUser.email}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Contraseña: {testUser.password}</p>
                </div>
              )}
              
              <Button
                onClick={() => navigate('/login')}
                variant="primary"
                fullWidth
              >
                Ir al inicio de sesión
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Registrarse
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-4 py-8 sm:px-10 bg-gray-50 dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nombre de Usuario"
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-gray-200 dark:bg-gray-700"
            />
            
            <Input
              label="Email"
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-200 dark:bg-gray-700"
            />

            <Input
              label="Contraseña"
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-200 dark:bg-gray-700"
            />

            <Input
              label="Nombre Completo (Opcional)"
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-gray-200 dark:bg-gray-700"
            />

            {error && !registrationSuccess && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {registrationSuccess && (
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {registrationSuccess}
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
                Registrarse
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  O usa datos de prueba
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={handleUseTestUser}
                variant="secondary"
                fullWidth
              >
                Completar con usuario de prueba
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Ya tienes cuenta? <Link to="/login" className="font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Inicia sesión aquí</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage; 