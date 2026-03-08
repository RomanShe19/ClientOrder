import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  prefix?: string;
  optional?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, optional, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || label;

    return (
      <div className={className}>
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
          {optional && <span className="text-text-secondary font-normal ml-1">(необязательно)</span>}
        </label>
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium select-none pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-3 border rounded-input bg-white text-text-primary
              placeholder-text-secondary transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:border-accent
              ${prefix ? 'pl-10' : ''}
              ${error ? 'border-error focus:ring-error animate-shake' : 'border-gray-300'}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-error mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
