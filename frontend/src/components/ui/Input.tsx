import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((
  { label, name, type = 'text', error, className, ...props }, 
  ref
) => {
  const baseInputStyles = 
    "block w-full appearance-none rounded-md border placeholder-gray-500 sm:text-sm bg-gray-700 text-white focus:outline-none";
  const normalBorder = "border-gray-600 focus:border-sky-500 focus:ring-sky-500";
  const errorBorder = "border-red-500 focus:border-red-600 focus:ring-red-600";
  const padding = "px-3 py-2";

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        className={`${baseInputStyles} ${error ? errorBorder : normalBorder} ${padding} ${className || ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 