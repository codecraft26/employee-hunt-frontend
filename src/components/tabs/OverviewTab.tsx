// components/tabs/OverviewTab.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Activity, 
  Trophy, 
  AlertCircle, 
  Plus,
  Target,
  MapPin,
  Vote,
  Building2,
  User
} from 'lucide-react';
import { Stats, QuickAction } from '../../types/admin';

interface OverviewTabProps {
  stats: Stats;
  onQuickAction?: (type: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
  stats,
  onQuickAction
}) => {
  const router = useRouter();

  const quickActions: QuickAction[] = [
    { title: 'Create Quiz', icon: Target, color: 'from-blue-500 to-blue-600', type: 'create-quiz' },
    { title: 'Start Treasure Hunt', icon: MapPin, color: 'from-green-500 to-green-600', type: 'create-hunt' },
    { title: 'Create Poll/Vote', icon: Vote, color: 'from-purple-500 to-purple-600', type: 'create-poll' },
    { title: 'Manage Teams', icon: Users, color: 'from-orange-500 to-orange-600', type: 'create-team' },
    { title: 'Manage Categories', icon: Building2, color: 'from-indigo-500 to-indigo-600', type: 'create-category' },
    { title: 'Manage Approval', icon: User, color: 'from-indigo-500 to-indigo-600', type: 'approve-user' }
  ];

  const handleQuickAction = (type: string) => {
    console.log(`Quick action: ${type}`);
    
    // Use parent's quick action handler if provided, otherwise use router navigation
    if (onQuickAction) {
      onQuickAction(type);
      return;
    }
    
    // Navigate to appropriate route based on quick action (fallback)
    switch (type) {
      case 'quiz':
      case 'create-quiz':
        router.push('/admin/quizzes');
        break;
      case 'treasure':
      case 'create-hunt':
        router.push('/admin/treasure-hunts');
        break;
      case 'poll':
      case 'create-poll':
        router.push('/admin/polls');
        break;
      case 'team':
      case 'create-team':
        router.push('/admin/teams');
        break;
      case 'create-category':
        router.push('/admin/categories');
        break;
      case 'approve-user':
        router.push('/admin/approveUser');
        break;
      default:
        console.log(`Unhandled quick action: ${type}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Horizontal Layout with Stats and Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Block - Stats Grid */}
        <div className="space-y-4 lg:space-y-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
            <p className="text-sm lg:text-base text-gray-600">Key metrics and statistics</p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Total Teams</p>
                  <p className="text-xl lg:text-3xl font-bold text-gray-900">{stats.totalTeams}</p>
                </div>
                <div className="p-2 lg:p-3 bg-blue-100 rounded-lg lg:rounded-xl">
                  <Users className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-xl lg:text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="p-2 lg:p-3 bg-green-100 rounded-lg lg:rounded-xl">
                  <Activity className="h-4 w-4 lg:h-6 lg:w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Active Contests</p>
                  <p className="text-xl lg:text-3xl font-bold text-gray-900">{stats.activeQuizzes + stats.activeTreasureHunts}</p>
                </div>
                <div className="p-2 lg:p-3 bg-purple-100 rounded-lg lg:rounded-xl">
                  <Trophy className="h-4 w-4 lg:h-6 lg:w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-xl lg:text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                </div>
                <div className="p-2 lg:p-3 bg-red-100 rounded-lg lg:rounded-xl">
                  <AlertCircle className="h-4 w-4 lg:h-6 lg:w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Block - Quick Actions */}
        <div className="space-y-4 lg:space-y-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
            <p className="text-sm lg:text-base text-gray-600">Manage your platform efficiently</p>
          </div>
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border p-4 lg:p-6">
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.type)}
                  className={`group relative overflow-hidden rounded-lg lg:rounded-xl p-4 lg:p-6 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl bg-gradient-to-r ${action.color}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <action.icon className="h-6 w-6 lg:h-8 lg:w-8 mb-2 lg:mb-3 opacity-90" />
                    <h3 className="font-semibold text-xs lg:text-sm leading-tight">{action.title}</h3>
                  </div>
                  <Plus className="absolute top-2 right-2 lg:top-3 lg:right-3 h-3 w-3 lg:h-4 lg:w-4 opacity-70 group-hover:rotate-90 transition-transform duration-200" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;