import React from 'react';
import { Clock, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface TimerDisplayProps {
  status: 'upcoming' | 'active' | 'ended';
  timeText: string;
  urgency: 'none' | 'normal' | 'medium' | 'high';
  variant?: 'compact' | 'detailed' | 'card';
  showIcon?: boolean;
  className?: string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  status,
  timeText,
  urgency,
  variant = 'compact',
  showIcon = true,
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'upcoming':
        return <Calendar className="h-4 w-4" />;
      case 'active':
        return <Clock className="h-4 w-4" />;
      case 'ended':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getUrgencyIcon = () => {
    if (urgency === 'high') {
      return <AlertTriangle className="h-3 w-3" />;
    }
    return null;
  };

  const getStatusColors = () => {
    switch (status) {
      case 'upcoming':
        return {
          bg: urgency === 'high' ? 'bg-orange-100' : 'bg-blue-100',
          text: urgency === 'high' ? 'text-orange-800' : 'text-blue-800',
          border: urgency === 'high' ? 'border-orange-200' : 'border-blue-200',
          dot: urgency === 'high' ? 'bg-orange-500' : 'bg-blue-500'
        };
      case 'active':
        return {
          bg: urgency === 'high' ? 'bg-red-100' : urgency === 'medium' ? 'bg-yellow-100' : 'bg-green-100',
          text: urgency === 'high' ? 'text-red-800' : urgency === 'medium' ? 'text-yellow-800' : 'text-green-800',
          border: urgency === 'high' ? 'border-red-200' : urgency === 'medium' ? 'border-yellow-200' : 'border-green-200',
          dot: urgency === 'high' ? 'bg-red-500' : urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        };
      case 'ended':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          dot: 'bg-gray-500'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          dot: 'bg-gray-500'
        };
    }
  };

  const colors = getStatusColors();

  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center space-x-1 text-xs font-medium ${colors.text} ${className}`}>
        {showIcon && getStatusIcon()}
        {urgency === 'high' && getUrgencyIcon()}
        <span>{timeText}</span>
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${colors.bg} ${colors.border} ${className}`}>
        <div className={`w-2 h-2 rounded-full ${colors.dot} ${urgency === 'high' ? 'animate-pulse' : ''}`}></div>
        <div className="flex items-center space-x-1">
          {showIcon && getStatusIcon()}
          {urgency === 'high' && getUrgencyIcon()}
        </div>
        <span className={`text-sm font-medium ${colors.text}`}>
          {timeText}
        </span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border} ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {showIcon && (
              <div className={`p-1 rounded-full ${colors.bg}`}>
                {getStatusIcon()}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-1">
                <span className={`text-sm font-semibold ${colors.text} capitalize`}>
                  {status}
                </span>
                {urgency === 'high' && getUrgencyIcon()}
              </div>
              <span className={`text-lg font-bold ${colors.text}`}>
                {timeText}
              </span>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${colors.dot} ${urgency === 'high' ? 'animate-pulse' : ''}`}></div>
        </div>
        
        {urgency === 'high' && status === 'active' && (
          <div className="mt-2 text-xs text-red-600 font-medium">
            ⚠️ Ending soon!
          </div>
        )}
        
        {urgency === 'high' && status === 'upcoming' && (
          <div className="mt-2 text-xs text-orange-600 font-medium">
            🚀 Starting soon!
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default TimerDisplay; 