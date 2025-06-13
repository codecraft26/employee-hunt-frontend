import React, { memo } from 'react';
import { Bell, LogOut } from 'lucide-react';

interface OptimizedHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconGradient: string;
  userName?: string;
  notificationCount?: number;
  onLogout: () => void;
}

const OptimizedHeader: React.FC<OptimizedHeaderProps> = memo(({
  title,
  subtitle,
  icon: Icon,
  iconGradient,
  userName,
  notificationCount = 0,
  onLogout
}) => {
  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className={`h-10 w-10 bg-gradient-to-r ${iconGradient} rounded-xl flex items-center justify-center`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 hidden sm:block">
                  {userName ? `${subtitle}, ${userName}` : subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {notificationCount > 0 && (
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

OptimizedHeader.displayName = 'OptimizedHeader';

export default OptimizedHeader; 