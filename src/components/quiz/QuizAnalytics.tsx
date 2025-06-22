'use client';

import { useState, useEffect } from 'react';
import { useQuizzes } from '@/hooks/useQuizzes';

interface QuizAnalyticsProps {
  quizId?: string;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

const StatCard = ({ title, value, icon, trend, trendDirection }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className={`text-sm ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trendDirection === 'up' ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  </div>
);

export const QuizAnalytics = ({ quizId, className = '' }: QuizAnalyticsProps) => {
  const { getQuizAnalytics, loading, error } = useQuizzes();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true);
      try {
        const data = await getQuizAnalytics(quizId);
        setAnalyticsData(data);
      } catch (err) {
        console.error('Failed to fetch quiz analytics:', err);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [quizId, getQuizAnalytics]);

  if (isLoadingAnalytics || loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !analyticsData) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 text-lg font-medium mb-2">Failed to load analytics</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use real data if available, otherwise fall back to sample data
  const stats = analyticsData || {
    totalQuizzes: 12,
    totalParticipants: 145,
    averageScore: 78.5,
    completionRate: 92.3,
    topPerformers: [
      { name: 'Alice Johnson', score: 95, team: 'Alpha' },
      { name: 'Bob Smith', score: 92, team: 'Beta' },
      { name: 'Carol Davis', score: 89, team: 'Gamma' }
    ],
    recentActivity: [
      { quiz: 'JavaScript Fundamentals', participants: 23, date: '2024-01-15' },
      { quiz: 'React Advanced', participants: 18, date: '2024-01-14' },
      { quiz: 'Node.js Basics', participants: 31, date: '2024-01-13' }
    ]
  };

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {quizId ? 'Quiz Analytics' : 'Quiz Dashboard Analytics'}
        </h2>
        {!analyticsData && (
          <p className="text-sm text-yellow-600 mt-1">
            Showing sample data - analytics integration in progress
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Quizzes"
          value={stats.totalQuizzes}
          icon="📊"
          trend={!quizId ? "+12%" : undefined}
          trendDirection={!quizId ? "up" : undefined}
        />
        <StatCard
          title="Total Participants"
          value={stats.totalParticipants}
          icon="👥"
          trend="+8%"
          trendDirection="up"
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon="🎯"
          trend="+2.5%"
          trendDirection="up"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon="✅"
          trend="+5.2%"
          trendDirection="up"
        />
      </div>

      {/* Top Performers */}
      {stats.topPerformers && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {stats.topPerformers.map((performer: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{performer.name}</div>
                    <div className="text-sm text-gray-500">Team {performer.team}</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900">{performer.score}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats.recentActivity && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Quiz Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <div className="font-medium text-gray-900">{activity.quiz}</div>
                  <div className="text-sm text-gray-500">{activity.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{activity.participants}</div>
                  <div className="text-sm text-gray-500">participants</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAnalytics;
