import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext'; 
import { UserRegistrationData, getRegistrationStatus as fetchRegistrationStatus } from '../../../services/authService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [formError, setFormError] = useState<string | null>(null);
  
  const [registrationStatus, setRegistrationStatus] = useState<'loading' | 'open' | 'closed'>('loading');
  const [registrationStatusMessage, setRegistrationStatusMessage] = useState<string | null>(null);

  const { register, isLoading: isRegistering, error: apiAuthError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetchRegistrationStatus();
        setRegistrationStatus(response.status);
        setRegistrationStatusMessage(response.message);
      } catch (error) {
        console.error("Error al verificar estado de registro:", error);
        setRegistrationStatus('closed');
        setRegistrationStatusMessage('No se pudo verificar el estado del registro. Por favor, intente más tarde.');
      }
    };
    checkStatus();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
        setFormError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    const registrationData: UserRegistrationData = {
      username,
      email,
      password,
      fullName: fullName || undefined, 
    };

    try {
      await register(registrationData);
      navigate('/login');
    } catch (err) {
      console.error("Error de registro en componente:", err);
    }
  };

  const genericApiError = apiAuthError ? (apiAuthError as any)?.message || 'Ocurrió un error al registrar.' : null;

  if (registrationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <p className="text-lg">Verificando estado del registro...</p>
      </div>
    );
  }

  if (registrationStatus === 'closed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4 text-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
          <h1 className="text-3xl font-bold mb-6 text-sky-400">Crear Cuenta</h1>
          <div className="bg-yellow-700 border border-yellow-900 text-yellow-100 px-4 py-3 rounded-md relative text-sm" role="alert">
            {registrationStatusMessage || 'El registro está actualmente cerrado.'}
          </div>
          <p className="mt-8 text-center text-sm text-gray-400">
            ¿Ya tienes una cuenta?{
              ' ' 
            }
            <Link to="/login" className="font-medium text-sky-400 hover:text-sky-300">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-8 text-center text-sky-400">Crear Cuenta</h1>

        {formError && (
          <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded-md relative mb-6 text-sm" role="alert">
            {formError}
          </div>
        )}
        {genericApiError && !formError && (
          <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded-md relative mb-6 text-sm" role="alert">
            {genericApiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nombre de Usuario"
            id="username"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isRegistering}
          />

          <Input
            label="Correo Electrónico"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isRegistering}
          />
          
          <Input
            label="Nombre Completo (Opcional)"
            id="fullName"
            name="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isRegistering}
          />

          <Input
            label="Contraseña"
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isRegistering}
          />

          <Input
            label="Confirmar Contraseña"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isRegistering}
          />

          <Button 
            type="submit" 
            isLoading={isRegistering}
            className="w-full"
          >
            Crear Cuenta
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          ¿Ya tienes una cuenta?{
            ' ' 
          }
          <Link to="/login" className="font-medium text-sky-400 hover:text-sky-300">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 