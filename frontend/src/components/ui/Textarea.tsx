import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  optional?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, optional, className = '', id, ...props }, ref) => {
    const textareaId = id || props.name || label;

    return (
      <div className={className}>
        <label htmlFor={textareaId} className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
          {optional && <span className="text-text-secondary font-normal ml-1">(необязательно)</span>}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-4 py-3 border rounded-input bg-white text-text-primary
            placeholder-text-secondary transition-all duration-200 resize-y min-h-[100px]
            focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:border-accent
            ${error ? 'border-error focus:ring-error animate-shake' : 'border-gray-300'}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="text-sm text-error mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
