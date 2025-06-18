'use client';

import React from 'react';
import { 
  Target,
  Vote,
  MapPin,
  Trophy,
  Megaphone,
  Calendar,
  User,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export interface TimelineItem {
  id: string;
  type: 'quiz' | 'poll' | 'treasure-hunt' | 'announcement';
  title: string;
  description: string;
  date: string;
  author?: {
    name: string;
    role: string;
  };
  status?: 'upcoming' | 'active' | 'completed';
  imageUrl?: string;
  metadata?: {
    participants?: number;
    duration?: string;
    reward?: string;
  };
}

interface TimelineComponentProps {
  items: TimelineItem[];
  onItemClick?: (item: TimelineItem) => void;
  showTimeline?: boolean;
  className?: string;
}

const TimelineComponent: React.FC<TimelineComponentProps> = ({
  items,
  onItemClick,
  showTimeline = true,
  className = ''
}) => {
  // Get gradient colors based on item type
  const getItemGradient = (type: string, status?: string) => {
    if (status === 'completed') {
      return 'from-gray-400 via-gray-500 to-gray-600';
    }
    
    switch (type) {
      case 'quiz':
        return 'from-blue-500 via-purple-500 to-indigo-600';
      case 'poll':
        return 'from-green-500 via-emerald-500 to-teal-600';
      case 'treasure-hunt':
        return 'from-orange-500 via-red-500 to-pink-600';
      case 'announcement':
        return 'from-yellow-400 via-orange-500 to-red-500';
      default:
        return 'from-gray-500 via-gray-600 to-gray-700';
    }
  };

  // Get icon component based on type
  const getIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return Target;
      case 'poll':
        return Vote;
      case 'treasure-hunt':
        return MapPin;
      case 'announcement':
        return Megaphone;
      default:
        return Sparkles;
    }
  };

  // Get status badge color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (items.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl p-12 text-center ${className}`}>
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-10 w-10 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Items Found</h3>
        <p className="text-gray-600">Check back later for new announcements and activities</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Timeline Line */}
      {showTimeline && items.length > 1 && (
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 opacity-30"></div>
      )}

      <div className="space-y-6">
        {items.map((item, index) => {
          const IconComponent = getIcon(item.type);
          const gradient = getItemGradient(item.type, item.status);
          
          return (
            <div key={item.id} className={`${showTimeline ? 'relative pl-20' : ''}`}>
              {/* Timeline Dot */}
              {showTimeline && (
                <div className={`absolute left-4 w-8 h-8 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Item Card */}
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 group">
                {/* Card Header with Gradient */}
                <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{item.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-white text-opacity-90 text-sm font-medium capitalize">
                            {item.type.replace('-', ' ')}
                          </span>
                          {item.status && (
                            <span className="px-2 py-1 rounded-full bg-white bg-opacity-20 text-white text-xs font-semibold uppercase tracking-wide">
                              {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-white text-opacity-90 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(item.date)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <p className="text-gray-700 text-base leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Metadata */}
                  {item.metadata && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      {item.metadata.participants && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{item.metadata.participants} participants</span>
                        </div>
                      )}
                      {item.metadata.duration && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{item.metadata.duration}</span>
                        </div>
                      )}
                      {item.metadata.reward && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Trophy className="h-4 w-4" />
                          <span>{item.metadata.reward}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image */}
                  {item.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-lg border shadow-sm"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {/* Author Info */}
                    {item.author && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="h-4 w-4" />
                        <span>Created by {item.author.name}</span>
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                          {item.author.role}
                        </span>
                      </div>
                    )}

                    {/* Action Button */}
                    {onItemClick && (
                      <button
                        onClick={() => onItemClick(item)}
                        className={`inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r ${gradient} text-white hover:opacity-90 transition-all duration-200 font-medium shadow-md hover:shadow-lg group-hover:scale-105`}
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineComponent; 