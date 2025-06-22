import React from 'react';

interface GamingCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glowing' | 'transparent';
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  shadow?: boolean;
}

const GamingCard: React.FC<GamingCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  onClick,
  padding = 'md',
  border = true,
  shadow = true,
}) => {
  const baseClasses = 'relative overflow-hidden rounded-2xl transition-all duration-300';
  
  const variantClasses = {
    default: 'gaming-card',
    elevated: 'gaming-card hover:shadow-2xl hover:shadow-blue-500/20',
    glowing: 'gaming-card neon-glow hover:neon-glow-purple',
    transparent: 'glass-dark',
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClasses = hover ? 'hover-lift' : '';
  const cursorClasses = onClick ? 'cursor-pointer' : '';
  const borderClasses = border ? 'border border-white/10' : '';
  const shadowClasses = shadow ? 'shadow-xl' : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    hoverClasses,
    cursorClasses,
    borderClasses,
    shadowClasses,
    className,
  ].join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-lg opacity-0 hover:opacity-100 transition-opacity duration-500" style={{ transitionDelay: '0.1s' }}></div>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 opacity-0 hover:opacity-100"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
    </div>
  );
};

export default GamingCard; 