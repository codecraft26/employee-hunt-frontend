import React, { memo } from 'react';
import { LogOut, Settings, Bell, User, Menu } from 'lucide-react';

interface OptimizedHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconGradient: string;
  userName?: string;
  onLogout: () => void;
}

const OptimizedHeader: React.FC<OptimizedHeaderProps> = memo(({
  title,
  subtitle,
  icon: Icon,
  iconGradient,
  userName,
  onLogout
}) => {
  return (
    <div className="glass backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
      <div className="px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
            <div className="relative group flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white drop-shadow-lg" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10"></div>
            </div>
            
            <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gradient flex items-center truncate">
                <span className="truncate">{title}</span>
                <div className="ml-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse flex-shrink-0"></div>
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-300 font-medium truncate">
                  {userName ? `${subtitle}, ${userName}` : subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button className="relative p-2 text-slate-300 hover:text-white transition-colors duration-300 group">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse border-2 border-slate-800"></div>
            </button>
            
            <button className="hidden sm:block p-2 text-slate-300 hover:text-white transition-colors duration-300 group">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
            
            <button className="hidden sm:block p-2 text-slate-300 hover:text-white transition-colors duration-300 group">
              <User className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-300" />
            </button>
            
            <button
              onClick={onLogout}
              className="relative p-2 sm:p-3 text-slate-300 hover:text-red-400 transition-all duration-300 group bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-lg sm:rounded-xl hover:from-red-500/20 hover:to-pink-500/20 border border-red-500/20 hover:border-red-500/40"
            >
              <LogOut className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </button>

            <button className="sm:hidden p-2 text-slate-300 hover:text-white transition-colors duration-300 group">
              <Menu className="h-6 w-6"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

OptimizedHeader.displayName = 'OptimizedHeader';

export default OptimizedHeader; 