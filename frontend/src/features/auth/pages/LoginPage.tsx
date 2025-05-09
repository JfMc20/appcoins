import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error: apiAuthError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      console.error("Error de login en componente:", err);
    }
  };

  const emailApiError = (apiAuthError as any)?.field === 'email' ? (apiAuthError as any)?.message : null;
  const passwordApiError = (apiAuthError as any)?.field === 'password' ? (apiAuthError as any)?.message : null;
  const genericApiError = !(emailApiError || passwordApiError) && apiAuthError ? (apiAuthError as any)?.message || 'Ocurrió un error' : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-sky-400">Iniciar Sesión</h1>
        
        {genericApiError && (
          <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded-md relative mb-6 text-sm" role="alert">
            {genericApiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Correo Electrónico"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            error={emailApiError}
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
            disabled={isLoading}
            error={passwordApiError}
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
          >
            Iniciar Sesión
          </Button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-400">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-medium text-sky-400 hover:text-sky-300">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 