import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftAddon,
  rightAddon,
  id,
  className = '',
  ...props
}) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700"
        >
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAddon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            {leftAddon}
          </div>
        )}
        <input
          id={inputId}
          {...props}
          className={`
            w-full rounded-lg border bg-white text-sm text-slate-900
            placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400
            transition-colors duration-150
            h-9 px-3
            ${leftAddon ? 'pl-9' : ''}
            ${rightAddon ? 'pr-9' : ''}
            ${error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-300'}
            ${className}
          `}
        />
        {rightAddon && (
          <div className="absolute right-3 text-slate-400 pointer-events-none">
            {rightAddon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
};
