import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface GamingInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
  label?: string;
  required?: boolean;
}

const GamingInput = forwardRef<HTMLInputElement, GamingInputProps>(({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error = false,
  success = false,
  icon: Icon,
  iconPosition = 'left',
  size = 'md',
  className = '',
  fullWidth = false,
  label,
  required = false,
}, ref) => {
  const baseClasses = 'relative overflow-hidden rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };
  
  const stateClasses = {
    default: 'gaming-input focus-within:ring-blue-500',
    error: 'gaming-input focus-within:ring-red-500 border-red-500/50',
    success: 'gaming-input focus-within:ring-green-500 border-green-500/50',
  };
  
  const state = error ? 'error' : success ? 'success' : 'default';
  const widthClasses = fullWidth ? 'w-full' : '';

  const classes = [
    baseClasses,
    sizeClasses[size],
    stateClasses[state],
    widthClasses,
    className,
  ].join(' ');

  return (
    <div className={`space-y-2 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className={classes}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"></div>
        
        {/* Input container */}
        <div className="relative flex items-center">
          {Icon && iconPosition === 'left' && (
            <div className="absolute left-3 z-10">
              <Icon className={`h-5 w-5 text-slate-400 ${size === 'lg' ? 'h-6 w-6' : ''}`} />
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            className={`
              w-full bg-transparent text-white placeholder-slate-400
              focus:outline-none focus:ring-0
              ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
              ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
              ${size === 'lg' ? 'text-lg' : ''}
            `}
          />
          
          {Icon && iconPosition === 'right' && (
            <div className="absolute right-3 z-10">
              <Icon className={`h-5 w-5 text-slate-400 ${size === 'lg' ? 'h-6 w-6' : ''}`} />
            </div>
          )}
        </div>
        
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-xl opacity-0 focus-within:opacity-20 transition-opacity duration-300 blur-sm ${
          state === 'error' ? 'bg-red-500' : 
          state === 'success' ? 'bg-green-500' : 
          'bg-blue-500'
        }`}></div>
      </div>
      
      {/* Error/Success message */}
      {error && (
        <p className="text-sm text-red-400 flex items-center">
          <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
          This field is required
        </p>
      )}
      
      {success && (
        <p className="text-sm text-green-400 flex items-center">
          <span className="w-1 h-1 bg-green-400 rounded-full mr-2"></span>
          Looks good!
        </p>
      )}
    </div>
  );
});

GamingInput.displayName = 'GamingInput';

export default GamingInput; 