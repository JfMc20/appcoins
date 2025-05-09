import { useState } from 'react';

interface UseNotificationReturn {
  error: string | null;
  successMessage: string | null;
  setError: (message: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  clearMessages: () => void;
}

/**
 * Hook para manejar notificaciones de éxito y error
 */
export const useNotification = (): UseNotificationReturn => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  return {
    error,
    successMessage,
    setError,
    setSuccessMessage,
    clearMessages
  };
};

export default useNotification; 