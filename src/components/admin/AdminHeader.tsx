// components/AdminHeader.tsx
import React, { memo } from 'react';
import { Crown, Bell, LogOut, User } from 'lucide-react';

interface AdminHeaderProps {
  pendingApprovals?: number;
  onLogout?: () => void;
  userName?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = memo(({ 
  pendingApprovals = 0, 
  onLogout,
  userName = 'Admin'
}) => {
  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
              <p className="text-sm text-gray-600 hidden sm:block">Manage teams, contests, and activities</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{userName}</span>
            </div>
            
            {/* Notifications */}
            {pendingApprovals > 0 && (
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingApprovals}
                </span>
              </button>
            )}
            
            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors rounded-lg border border-red-200"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

AdminHeader.displayName = 'AdminHeader';

export default AdminHeader;