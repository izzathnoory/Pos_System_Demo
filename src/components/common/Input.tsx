import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3 text-slate-400 pointer-events-none">{icon}</div>}
        <input
          id={inputId}
          className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4EAE]/30 focus:border-[#0B4EAE] ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300'} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-600">{error}</span>}
      {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
    </div>
  );
};
