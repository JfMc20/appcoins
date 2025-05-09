import React from 'react';

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

/**
 * Componente para mostrar notificaciones de éxito o error
 */
const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  const isSuccess = type === 'success';

  const bgColor = isSuccess 
    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';

  const textColor = isSuccess 
    ? 'text-green-700 dark:text-green-400' 
    : 'text-red-700 dark:text-red-400';

  const iconColor = isSuccess ? 'text-green-400' : 'text-red-400';
  const hoverColor = isSuccess ? 'hover:bg-green-100 dark:hover:bg-green-900/50' : 'hover:bg-red-100 dark:hover:bg-red-900/50';

  return (
    <div className={`mb-4 rounded-md ${bgColor} p-4 border`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {isSuccess ? (
            <svg className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p className={`text-sm ${textColor}`}>{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${textColor} ${hoverColor} focus:outline-none`}
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification; 