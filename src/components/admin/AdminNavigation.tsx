// components/AdminNavigation.tsx
import React, { memo } from 'react';
import { BarChart3, Target, MapPin, Vote, Users, CheckCircle, Building2 } from 'lucide-react';
import { TabView } from '../../types/admin';

interface AdminNavigationProps {
  activeView: TabView;
  onViewChange: (view: TabView) => void;
  pendingApprovals?: number;
}

// Static tabs array - moved outside component to prevent re-creation
const NAVIGATION_TABS = [
  { id: 'overview' as TabView, label: 'Overview', icon: BarChart3 },
  { id: 'quizzes' as TabView, label: 'Quizzes', icon: Target },
  { id: 'treasure-hunts' as TabView, label: 'Treasure Hunts', icon: MapPin },
  { id: 'polls' as TabView, label: 'Polls & Voting', icon: Vote },
  { id: 'teams' as TabView, label: 'Teams', icon: Users },
  { id: 'categories' as TabView, label: 'Categories', icon: Building2 },
  { id: 'approvals' as TabView, label: 'Approvals', icon: CheckCircle },
];

const AdminNavigation: React.FC<AdminNavigationProps> = memo(({
  activeView,
  onViewChange,
  pendingApprovals = 0
}) => {
  return (
    <div className="bg-white border-b sticky top-16 z-30">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mb-px flex space-x-8 overflow-x-auto" style={{ scrollbarWidth: 'none', '-ms-overflow-style': 'none' }}>
          {NAVIGATION_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeView === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.id === 'approvals' && pendingApprovals > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingApprovals}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
});

AdminNavigation.displayName = 'AdminNavigation';

export default AdminNavigation;