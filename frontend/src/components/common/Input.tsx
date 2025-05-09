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
            className={`block text-sm font-medium mb-1 dark:text-gray-200 ${labelClassName}`}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm 
                     focus:outline-none focus:ring-primary focus:border-primary text-gray-900 dark:text-gray-100
                     ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                     ${fullWidth ? 'w-full' : ''}
                     ${inputClassName}`}
          {...rest}
        />
        {error && (
          <p className={`mt-1 text-sm text-red-500 ${errorClassName}`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 