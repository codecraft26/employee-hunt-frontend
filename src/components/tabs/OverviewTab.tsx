// components/tabs/OverviewTab.tsx
import React from 'react';
import { 
  Users, 
  Activity, 
  Trophy, 
  AlertCircle, 
  Plus,
  Target,
  MapPin,
  Vote
} from 'lucide-react';
import { Stats, Team, RecentActivity, QuickAction } from '../../types/admin';

interface OverviewTabProps {
  stats: Stats;
  teams: Team[];
  recentActivities: RecentActivity[];
  onQuickAction: (type: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
  stats, 
  teams, 
  recentActivities, 
  onQuickAction 
}) => {
  const quickActions: QuickAction[] = [
    { title: 'Create Quiz', icon: Target, color: 'from-blue-500 to-blue-600', type: 'quiz' },
    { title: 'Start Treasure Hunt', icon: MapPin, color: 'from-green-500 to-green-600', type: 'treasure' },
    { title: 'Create Poll/Vote', icon: Vote, color: 'from-purple-500 to-purple-600', type: 'poll' },
    { title: 'Manage Teams', icon: Users, color: 'from-orange-500 to-orange-600', type: 'team' }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return Target;
      case 'treasure': return MapPin;
      case 'poll': return Vote;
      case 'team': return Users;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Teams</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTeams}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Contests</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeQuizzes + stats.activeTreasureHunts}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => onQuickAction(action.type)}
              className={`group relative overflow-hidden rounded-xl p-6 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl bg-gradient-to-r ${action.color}`}
            >
              <div className="flex flex-col items-center text-center">
                <action.icon className="h-8 w-8 mb-3 opacity-90" />
                <h3 className="font-semibold">{action.title}</h3>
              </div>
              <Plus className="absolute top-3 right-3 h-5 w-5 opacity-70 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activities and Team Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = getTypeIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <IconComponent className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.time}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Team Leaderboard */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Team Leaderboard</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white ${
                      team.rank === 1 ? 'bg-yellow-500' : 
                      team.rank === 2 ? 'bg-gray-400' : 
                      team.rank === 3 ? 'bg-amber-600' : 'bg-indigo-500'
                    }`}>
                      {team.rank}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-600">{team.members} members • {team.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{team.points}</p>
                    <p className="text-xs text-gray-600">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;