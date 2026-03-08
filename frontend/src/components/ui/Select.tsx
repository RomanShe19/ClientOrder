import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
  optional?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, placeholder = 'Выберите...', optional, className = '', id, ...props }, ref) => {
    const selectId = id || props.name || label;

    return (
      <div className={className}>
        <label htmlFor={selectId} className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
          {optional && <span className="text-text-secondary font-normal ml-1">(необязательно)</span>}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-4 py-3 border rounded-input bg-white text-text-primary
            transition-all duration-200 appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:border-accent
            bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')]
            bg-no-repeat bg-[center_right_1rem]
            ${error ? 'border-error focus:ring-error animate-shake' : 'border-gray-300'}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="text-sm text-error mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
