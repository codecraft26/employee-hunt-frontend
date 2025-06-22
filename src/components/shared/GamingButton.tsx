import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GamingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  className?: string;
  fullWidth?: boolean;
}

const GamingButton: React.FC<GamingButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  fullWidth = false,
}) => {
  const baseClasses = 'relative overflow-hidden rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const variantClasses = {
    primary: 'bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl focus:ring-blue-500',
    secondary: 'bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl focus:ring-cyan-500',
    success: 'bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
    warning: 'bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
    danger: 'bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
    ghost: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 focus:ring-white/50',
  };
  
  const glowClasses = {
    primary: 'hover:shadow-blue-500/25',
    secondary: 'hover:shadow-cyan-500/25',
    success: 'hover:shadow-green-500/25',
    warning: 'hover:shadow-yellow-500/25',
    danger: 'hover:shadow-red-500/25',
    ghost: 'hover:shadow-white/10',
  };

  const classes = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    glowClasses[variant],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center space-x-2">
        {loading && (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        )}
        
        {Icon && iconPosition === 'left' && !loading && (
          <Icon className="h-4 w-4" />
        )}
        
        <span>{children}</span>
        
        {Icon && iconPosition === 'right' && !loading && (
          <Icon className="h-4 w-4" />
        )}
      </div>
      
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${variantClasses[variant].split(' ')[1]} opacity-0 hover:opacity-20 transition-opacity duration-300 blur-sm`}></div>
    </button>
  );
};

export default GamingButton; 