import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RegisterData } from '../types/auth.types';

// Estilos básicos en línea para empezar.
const styles = {
  container: { display: 'flex', flexDirection: 'column' as 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  form: { display: 'flex', flexDirection: 'column' as 'column', gap: '10px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' },
  input: { padding: '10px', fontSize: '16px' },
  button: { padding: '10px', fontSize: '16px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' },
  error: { color: 'red', marginTop: '10px' },
  success: { color: 'green', marginTop: '10px' },
  link: { marginTop: '15px' }
};

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);
  const { registerUser, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setRegistrationSuccess(null);
    const userData: RegisterData = { username, email, password, fullName };
    try {
      await registerUser(userData);
      setRegistrationSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
      // Opcional: redirigir automáticamente al login después de un tiempo o con un botón
      // setTimeout(() => navigate('/login'), 3000);
    } catch (registerError) {
      console.error('Error de registro en la página:', registerError);
      setRegistrationSuccess(null); // Asegurarse de que no se muestre el mensaje de éxito si hay error
    }
  };

  return (
    <div style={styles.container}>
      <h2>Registrarse</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div>
          <label htmlFor="username">Nombre de Usuario:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div>
          <label htmlFor="fullName">Nombre Completo (Opcional):</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={styles.input}
          />
        </div>
        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </button>
        {error && !registrationSuccess && <p style={styles.error}>{error}</p>}
        {registrationSuccess && <p style={styles.success}>{registrationSuccess}</p>}
      </form>
      <div style={styles.link}>
        <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage; 