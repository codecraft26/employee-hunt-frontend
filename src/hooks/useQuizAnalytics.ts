import { useState, useCallback } from 'react';
import { quizAnalyticsService } from '../services/quizService';

export interface QuizAnalyticsDashboard {
  overview: {
    totalQuizzes: number;
    activeQuizzes: number;
    completedQuizzes: number;
    totalParticipants: number;
  };
  trends: {
    period: string;
    totalQuizzesCreated: number;
    totalAnswersSubmitted: number;
    recentActivity: Array<{
      date: string;
      quizzesCreated: number;
      answersSubmitted: number;
    }>;
  };
  topQuizzes: Array<{
    id: string;
    title: string;
    stats: {
      averageScore: string;
      participationRate: string;
      totalParticipants: number;
    };
  }>;
  summary: {
    totalQuizzes: number;
    activeQuizzes: number;
    participationRate: string;
    averageAccuracy: string;
  };
}

export interface QuizAnalyticsDetailed {
  quizInfo: {
    id: string;
    title: string;
    status: string;
    totalParticipants: number;
    totalQuestions: number;
  };
  participation: {
    totalParticipants: number;
    participantsAnswered: number;
    participationRate: string;
  };
  performance: {
    averageScore: string;
    highestScore: string;
    lowestScore: string;
    medianScore: string;
  };
  timeAnalysis: {
    averageTimePerQuestion: number;
    fastestAnswer: number;
    slowestAnswer: number;
  };
}

export interface QuizOverview {
  overview: {
    totalQuizzes: number;
    activeQuizzes: number;
    completedQuizzes: number;
    draftQuizzes: number;
  };
  participation: {
    totalParticipants: number;
    activeParticipants: number;
    participationRate: string;
  };
  performance: {
    averageScore: string;
    highestScore: string;
    lowestScore: string;
  };
}

export interface QuestionAnalytics {
  questionId: string;
  question: string;
  correctAnswer: number;
  statistics: {
    totalAnswers: number;
    correctAnswers: number;
    accuracy: string;
    averageTime: number;
  };
  optionBreakdown: Array<{
    option: string;
    selectedCount: number;
    percentage: string;
  }>;
}

export interface TeamPerformance {
  teamId: string;
  teamName: string;
  totalScore: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: string;
  averageTime: number;
  rank: number;
  members: Array<{
    userId: string;
    userName: string;
    individualScore: number;
    questionsAnswered: number;
  }>;
}

export interface UserPerformance {
  userId: string;
  userName: string;
  teamName: string;
  totalScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: string;
  averageTime: number;
  rank: number;
}

export interface TimeAnalytics {
  overall: {
    averageTimePerQuestion: number;
    fastestAnswer: number;
    slowestAnswer: number;
    medianTime: number;
  };
  questionBreakdown: Array<{
    questionId: string;
    averageTime: number;
    fastestTime: number;
    slowestTime: number;
  }>;
  timeDistribution: Array<{
    range: string;
    count: number;
    percentage: string;
  }>;
}

export interface ComparativeAnalytics {
  id: string;
  title: string;
  stats: {
    averageScore: string;
    participationRate: string;
    totalParticipants: number;
    totalQuestions: number;
    averageTime: number;
  };
  comparison: {
    scoreRank: number;
    participationRank: number;
    timeRank: number;
  };
}

export interface TrendAnalytics {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  overview: {
    totalQuizzes: number;
    totalParticipants: number;
    averageScore: number;
    averageCompletionRate: number;
  };
  dailyTrends: Array<{
    date: string;
    quizzesCreated: number;
    quizzesCompleted: number;
    participants: number;
    averageScore: number;
  }>;
  popularityTrends: Array<{
    quizId: string;
    title: string;
    trendDirection: 'UP' | 'DOWN' | 'STABLE';
    participationChange: number;
    scoreChange: number;
  }>;
  performanceTrends: {
    scoreImprovement: Array<{
      date: string;
      averageScore: number;
      previousPeriodComparison: number;
    }>;
    participationGrowth: Array<{
      date: string;
      participants: number;
      growthRate: number;
    }>;
  };
}

export const useQuizAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get Dashboard Summary
  const getDashboardSummary = useCallback(async (): Promise<QuizAnalyticsDashboard | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quizAnalyticsService.getDashboardSummary();
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch dashboard summary');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch dashboard summary';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Overview
  const getOverview = useCallback(async (): Promise<QuizOverview | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quizAnalyticsService.getOverview();
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch overview');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch overview';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Detailed Quiz Analytics
  const getQuizAnalytics = useCallback(async (quizId: string): Promise<any | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quizAnalyticsService.getQuizAnalytics(quizId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch quiz analytics');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch quiz analytics';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Question Analytics
  const getQuestionAnalytics = useCallback(async (quizId: string): Promise<QuestionAnalytics[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quizAnalyticsService.getQuestionAnalytics(quizId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch question analytics');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch question analytics';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Team Performance
  const getTeamPerformance = useCallback(async (quizId: string): Promise<TeamPerformance[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quizAnalyticsService.getTeamPerformance(quizId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch team performance');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch team performance';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get User Performance
  const getUserPerformance = useCallback(async (quizId: string): Promise<UserPerformance[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quizAnalyticsService.getUserPerformance(quizId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch user performance');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch user performance';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Time Analytics
  const getTimeAnalytics = useCallback(async (quizId: string): Promise<TimeAnalytics | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quizAnalyticsService.getTimeAnalytics(quizId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch time analytics');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch time analytics';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Trend Analytics
  const getTrendAnalytics = useCallback(async (days?: number): Promise<TrendAnalytics | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = days 
        ? await quizAnalyticsService.getTrendAnalyticsForDays(days)
        : await quizAnalyticsService.getTrendAnalytics();
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch trend analytics');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch trend analytics';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Comparative Analytics
  const getComparativeAnalytics = useCallback(async (): Promise<ComparativeAnalytics[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quizAnalyticsService.getComparativeAnalytics();
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch comparative analytics');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch comparative analytics';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getDashboardSummary,
    getOverview,
    getQuizAnalytics,
    getQuestionAnalytics,
    getTeamPerformance,
    getUserPerformance,
    getTimeAnalytics,
    getTrendAnalytics,
    getComparativeAnalytics,
  };
};
