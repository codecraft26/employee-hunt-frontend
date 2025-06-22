// components/quiz/QuizLeaderboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Users, Star, Crown } from 'lucide-react';
import { useUserQuizzes } from '../../hooks/useUserQuizzes';

interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  totalScore: number;
  averageScore: number;
  quizzesCompleted: number;
  totalQuizzes: number;
  rank: number;
}

interface QuizLeaderboardProps {
  className?: string;
  showTitle?: boolean;
  maxEntries?: number;
}

const QuizLeaderboard: React.FC<QuizLeaderboardProps> = ({ 
  className = '', 
  showTitle = true,
  maxEntries = 10
}) => {
  const { loading, error, teamRankings } = useUserQuizzes();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Transform team rankings into leaderboard format
    if (teamRankings && teamRankings.length > 0) {
      const transformedData = teamRankings.slice(0, maxEntries).map((team, index) => ({
        teamId: team.teamId,
        teamName: team.teamName,
        totalScore: team.totalScore,
        averageScore: team.averageScore || 0,
        quizzesCompleted: team.completedQuestions || 0,
        totalQuizzes: team.totalParticipants || 0,
        rank: index + 1
      }));
      setLeaderboard(transformedData);
    }
  }, [teamRankings, maxEntries]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-500" />;
      default:
        return <Star className="h-5 w-5 text-blue-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`gaming-card p-6 ${className}`}>
        {showTitle && (
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-white">Quiz Leaderboard</h3>
          </div>
        )}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-600 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-8 bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`gaming-card p-6 ${className}`}>
        {showTitle && (
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-white">Quiz Leaderboard</h3>
          </div>
        )}
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Unable to load leaderboard</p>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className={`gaming-card p-6 ${className}`}>
        {showTitle && (
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-white">Quiz Leaderboard</h3>
          </div>
        )}
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No quiz results available yet</p>
          <p className="text-sm text-gray-500 mt-2">Complete some quizzes to see the leaderboard!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`gaming-card p-6 ${className}`}>
      {showTitle && (
        <div className="flex items-center space-x-3 mb-6">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-white">Quiz Leaderboard</h3>
          <div className="ml-auto text-sm text-gray-400">
            Top {leaderboard.length} Teams
          </div>
        </div>
      )}

      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.teamId}
            className={`p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg ${getRankColor(entry.rank)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                  {entry.rank <= 3 ? (
                    getRankIcon(entry.rank)
                  ) : (
                    <span className="text-white font-bold text-sm">#{entry.rank}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{entry.teamName}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{entry.quizzesCompleted} Quizzes</span>
                    <span>•</span>
                    <span>Avg: {Math.round(entry.averageScore)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{entry.totalScore}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>

            {/* Progress bar for completion rate */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Quiz Completion</span>
                <span>
                  {entry.totalQuizzes > 0 
                    ? Math.round((entry.quizzesCompleted / entry.totalQuizzes) * 100)
                    : 0
                  }%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${entry.totalQuizzes > 0 
                      ? (entry.quizzesCompleted / entry.totalQuizzes) * 100 
                      : 0
                    }%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === maxEntries && (
        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing top {maxEntries} teams
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizLeaderboard;
