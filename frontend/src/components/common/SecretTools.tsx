import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Pathnames from '../../router/pathnames';

/**
 * Componente invisible que detecta una combinación de teclas especial
 * para activar el acceso a herramientas de diagnóstico ocultas.
 * 
 * Combinación: Control + Alt + D seguido de la tecla T en 2 segundos
 */
export const SecretTools: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [secretSequence, setSecretSequence] = useState<string[]>([]);
  const [lastKeyTime, setLastKeyTime] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      
      // Limpiar secuencia si pasaron más de 2 segundos
      if (now - lastKeyTime > 2000 && secretSequence.length > 0) {
        setSecretSequence([]);
      }
      
      setLastKeyTime(now);
      
      // Detectar Ctrl+Alt+D
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        setSecretSequence(prev => [...prev, 'ctrl+alt+d']);
        e.preventDefault();
        return;
      }
      
      // Si ya presionó Ctrl+Alt+D, esperar la T
      if (secretSequence.includes('ctrl+alt+d') && e.key === 't') {
        // Solo permitir a administradores
        if (user?.role === 'admin') {
          console.log('Modo diagnóstico activado');
          navigate(Pathnames.secureTools.loginDebug);
        } else {
          console.log('Acceso denegado: se requiere rol de administrador');
        }
        setSecretSequence([]);
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, secretSequence, lastKeyTime, user]);
  
  // Este componente no renderiza nada visible
  return null;
}; 