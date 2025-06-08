// components/AdminNavigation.tsx
import React from 'react';
import { BarChart3, Target, MapPin, Vote, Users, CheckCircle } from 'lucide-react';
import { TabView } from '../../types/admin';

interface AdminNavigationProps {
  activeView: TabView;
  onViewChange: (view: TabView) => void;
  pendingApprovals: number;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ 
  activeView, 
  onViewChange, 
  pendingApprovals 
}) => {
  const tabs = [
    { id: 'overview' as TabView, label: 'Overview', icon: BarChart3 },
    { id: 'quizzes' as TabView, label: 'Quizzes', icon: Target },
    { id: 'treasure-hunts' as TabView, label: 'Treasure Hunts', icon: MapPin },
    { id: 'polls' as TabView, label: 'Polls & Voting', icon: Vote },
    { id: 'teams' as TabView, label: 'Teams', icon: Users },
    { id: 'approvals' as TabView, label: 'Approvals', icon: CheckCircle },
  ];

  return (
    <div className="bg-white border-b overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeView === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.id === 'approvals' && pendingApprovals > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingApprovals}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;