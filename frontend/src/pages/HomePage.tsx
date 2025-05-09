import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Estilos básicos en línea para empezar.
const styles = {
  container: { display: 'flex', flexDirection: 'column' as 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  welcomeMessage: { fontSize: '24px', marginBottom: '20px' },
  button: { padding: '10px 20px', fontSize: '16px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }
};

const HomePage: React.FC = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login'); // Redirigir a login después de logout
  };

  return (
    <div style={styles.container}>
      {user ? (
        <h1 style={styles.welcomeMessage}>
          ¡Bienvenido, {user.fullName || user.username}! 
        </h1>
      ) : (
        <h1 style={styles.welcomeMessage}>Bienvenido</h1>
      )}
      <p>Esta es tu página de inicio.</p>
      {/* Aquí iría el contenido principal de la aplicación */}
      <button onClick={handleLogout} style={styles.button}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default HomePage; 