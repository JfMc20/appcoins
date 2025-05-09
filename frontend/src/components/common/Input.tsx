import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    fullWidth = true, 
    className = '', 
    labelClassName = '', 
    inputClassName = '',
    errorClassName = '',
    id,
    ...rest 
  }, ref) => {
    const inputId = id || `input-${rest.name || Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label 
            htmlFor={inputId} 
            className={`block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200 ${labelClassName}`}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`px-3 py-2 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                     focus:outline-none focus:ring-gray-500 focus:border-gray-500 text-gray-900 dark:text-gray-100
                     ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                     ${fullWidth ? 'w-full' : ''}
                     ${inputClassName}`}
          {...rest}
        />
        {error && (
          <p className={`mt-1 text-sm text-red-600 dark:text-red-400 ${errorClassName}`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 