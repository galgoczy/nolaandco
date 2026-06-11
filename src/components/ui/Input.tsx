import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-carbon-light text-sm font-body"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`bg-surface-container rounded-[0.75rem] px-4 py-3 text-carbon font-body outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${
            error ? 'ring-2 ring-red-400' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-red-500 text-xs mt-0.5">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
