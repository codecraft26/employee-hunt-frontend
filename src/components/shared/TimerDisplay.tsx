import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface TimerDisplayProps {
  status: 'upcoming' | 'active' | 'ended';
  timeText?: string;
  urgency: 'none' | 'normal' | 'medium' | 'high';
  variant?: 'compact' | 'detailed' | 'card';
  showIcon?: boolean;
  className?: string;
  startTime?: string;
  endTime?: string;
  showCountdown?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  status,
  timeText,
  urgency,
  variant = 'compact',
  showIcon = true,
  className = '',
  startTime,
  endTime,
  showCountdown = true
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentUrgency, setCurrentUrgency] = useState(urgency);

  const calculateTimeRemaining = useCallback(() => {
    if (!startTime || !endTime) return '';

    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (now < start) {
      setCurrentStatus('upcoming');
      const timeUntilStart = start - now;
      const days = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeUntilStart % (1000 * 60)) / 1000);

      if (timeUntilStart < 60 * 60 * 1000) {
        setCurrentUrgency('high');
      } else if (timeUntilStart < 24 * 60 * 60 * 1000) {
        setCurrentUrgency('medium');
      } else {
        setCurrentUrgency('normal');
      }

      if (days > 0) {
        return `Starts in ${days}d ${hours}h`;
      } else if (hours > 0) {
        return `Starts in ${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `Starts in ${minutes}m ${seconds}s`;
      } else {
        return `Starts in ${seconds}s`;
      }
    } else if (now >= start && now < end) {
      setCurrentStatus('active');
      const timeLeft = end - now;
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      if (timeLeft < 60 * 60 * 1000) {
        setCurrentUrgency('high');
      } else if (timeLeft < 24 * 60 * 60 * 1000) {
        setCurrentUrgency('medium');
      } else {
        setCurrentUrgency('normal');
      }

      if (days > 0) {
        return `${days}d ${hours}h remaining`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m remaining`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s remaining`;
      } else {
        return `${seconds}s remaining`;
      }
    } else {
      setCurrentStatus('ended');
      setCurrentUrgency('none');
      return 'Ended';
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (!showCountdown || !startTime || !endTime) {
      setTimeRemaining(timeText || '');
      return;
    }

    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeRemaining, showCountdown, startTime, endTime, timeText]);

  const getStatusIcon = () => {
    switch (currentStatus) {
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
    if (currentUrgency === 'high') {
      return <AlertTriangle className="h-3 w-3" />;
    }
    return null;
  };

  const getStatusColors = () => {
    switch (currentStatus) {
      case 'upcoming':
        return {
          bg: currentUrgency === 'high' ? 'bg-orange-100' : 'bg-blue-100',
          text: currentUrgency === 'high' ? 'text-orange-800' : 'text-blue-800',
          border: currentUrgency === 'high' ? 'border-orange-200' : 'border-blue-200',
          dot: currentUrgency === 'high' ? 'bg-orange-500' : 'bg-blue-500'
        };
      case 'active':
        return {
          bg: currentUrgency === 'high' ? 'bg-red-100' : currentUrgency === 'medium' ? 'bg-yellow-100' : 'bg-green-100',
          text: currentUrgency === 'high' ? 'text-red-800' : currentUrgency === 'medium' ? 'text-yellow-800' : 'text-green-800',
          border: currentUrgency === 'high' ? 'border-red-200' : currentUrgency === 'medium' ? 'border-yellow-200' : 'border-green-200',
          dot: currentUrgency === 'high' ? 'bg-red-500' : currentUrgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
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
        {currentUrgency === 'high' && getUrgencyIcon()}
        <span className={currentUrgency === 'high' ? 'font-bold' : ''}>
          {timeRemaining}
        </span>
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${colors.bg} ${colors.border} ${className}`}>
        <div className={`w-2 h-2 rounded-full ${colors.dot} ${currentUrgency === 'high' ? 'animate-pulse' : ''}`}></div>
        <div className="flex items-center space-x-1">
          {showIcon && getStatusIcon()}
          {currentUrgency === 'high' && getUrgencyIcon()}
        </div>
        <span className={`text-sm font-medium ${colors.text} ${currentUrgency === 'high' ? 'font-bold' : ''}`}>
          {timeRemaining}
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
                  {currentStatus}
                </span>
                {currentUrgency === 'high' && getUrgencyIcon()}
              </div>
              <span className={`text-lg font-bold ${colors.text} ${currentUrgency === 'high' ? 'animate-pulse' : ''}`}>
                {timeRemaining}
              </span>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${colors.dot} ${currentUrgency === 'high' ? 'animate-pulse' : ''}`}></div>
        </div>
        
        {currentUrgency === 'high' && currentStatus === 'active' && (
          <div className="mt-2 text-xs text-red-600 font-medium">
            ⚠️ Ending soon!
          </div>
        )}
        
        {currentUrgency === 'high' && currentStatus === 'upcoming' && (
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