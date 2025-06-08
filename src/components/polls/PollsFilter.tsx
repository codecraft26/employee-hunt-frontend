// components/polls/PollsFilter.tsx
import React from 'react';
import { Filter, Calendar, Users, BarChart3 } from 'lucide-react';
import { VoteStatus, VoteType } from '../../types/votes';

interface PollsFilterProps {
  activeStatus: VoteStatus | 'ALL';
  activeType: VoteType | 'ALL';
  onStatusChange: (status: VoteStatus | 'ALL') => void;
  onTypeChange: (type: VoteType | 'ALL') => void;
  pollCounts: {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
  };
}

const PollsFilter: React.FC<PollsFilterProps> = ({
  activeStatus,
  activeType,
  onStatusChange,
  onTypeChange,
  pollCounts
}) => {
  const statusFilters = [
    { key: 'ALL' as const, label: 'All Polls', count: pollCounts.total, color: 'bg-gray-100 text-gray-800' },
    { key: VoteStatus.ACTIVE, label: 'Active', count: pollCounts.active, color: 'bg-green-100 text-green-800' },
    { key: VoteStatus.UPCOMING, label: 'Upcoming', count: pollCounts.upcoming, color: 'bg-yellow-100 text-yellow-800' },
    { key: VoteStatus.COMPLETED, label: 'Completed', count: pollCounts.completed, color: 'bg-blue-100 text-blue-800' },
  ];

  const typeFilters = [
    { key: 'ALL' as const, label: 'All Types', icon: BarChart3 },
    { key: VoteType.SINGLE_CHOICE, label: 'Single Choice', icon: Users },
    { key: VoteType.MULTI_CHOICE, label: 'Multiple Choice', icon: Calendar },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="font-medium text-gray-900">Filter Polls</h3>
      </div>

      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => onStatusChange(filter.key)}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeStatus === filter.key
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{filter.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter.color}`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Poll Type</label>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => onTypeChange(filter.key)}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeType === filter.key
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <filter.icon className="h-4 w-4" />
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollsFilter;