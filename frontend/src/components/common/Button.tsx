import React from 'react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  fullWidth = false,
  onClick,
  children,
  className = '',
}) => {
  const baseClasses = 'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-900';
  
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:focus:ring-gray-600',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 focus:ring-gray-500',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };
  
  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Cargando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button; 