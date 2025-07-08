// hooks/useQuizzes.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number | null;
  points: number;
  timeLimit: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizUser {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeCode?: string | null;
  gender?: string | null;
  profileImage?: string | null;
  department?: string | null;
  hobbies?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuizTeam {
  id: string;
  name: string;
  description: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'DRAFT';
  questionDistributionType: 'SEQUENTIAL' | 'RANDOM';
  startTime: string;
  endTime: string;
  resultDisplayTime: string;
  isResultPublished: boolean;
  totalTeams: number;
  totalParticipants: number;
  totalQuestions: number;
  questionsPerParticipant: number;
  createdAt: string;
  updatedAt: string;
  questions: QuizQuestion[];
  winningTeam?: QuizTeam | null;
  createdBy?: QuizUser;
}

export interface UpdateQuizRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  resultDisplayTime: string;
  questionDistributionType: 'SEQUENTIAL' | 'RANDOM';
  questionsPerParticipant: number;
}

export interface UpdateQuestionRequest {
  question: string;
  options: string[];
  correctAnswer: number | null;
  points: number;
  timeLimit: number;
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  resultDisplayTime: string;
  questionDistributionType: 'SEQUENTIAL' | 'RANDOM';
  questionsPerParticipant: number;
  questions: Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>[];
}

export interface QuizResponse {
  success: boolean;
  message: string;
  data: Quiz;
}

export interface QuizzesListResponse {
  success: boolean;
  data: Quiz[];
}

export interface DeclareWinnerResponse {
  success: boolean;
  data: Quiz;
}

export interface DeclareWinnerRequest {
  teamId: string;
}

export interface TeamRankingItem {
  rank: number;
  team: QuizTeam;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  averageTime: number;
  // Support multiple possible response formats
  totalScore?: number;
  teamId?: string;
  teamName?: string;
  completedQuestions?: number;
  totalParticipants?: number;
  completedParticipants?: number;
  averageScore?: number;
}

export interface TeamRankingsResponse {
  success: boolean;
  data: {
    quiz: Quiz;
    rankings: TeamRankingItem[];
    totalTeams: number;
  };
  message?: string;
}

export interface QuizAnalyticsData {
  quiz: Quiz;
  summary: {
    totalAssigned: number;
    totalAnswered: number;
    correctAnswers: number;
    accuracy: string;
    totalPointsEarned: number;
    averagePointsPerAnswer: string;
    completionRate: string;
  };
  questionAnalytics: Array<{
    question: QuizQuestion;
    stats: {
      totalAnswers: number;
      correctAnswers: number;
      accuracy: string;
      averageTime: string;
      optionDistribution: number[];
    };
  }>;
  teamPerformance: Array<{
    team: QuizTeam;
    stats: {
      totalAnswers: number;
      correctAnswers: number;
      accuracy: string;
      totalPoints: number;
      averageTime: string;
      memberStats: Array<{
        user: QuizUser;
        stats: {
          totalAnswers: number;
          correctAnswers: number;
          accuracy: string;
          totalPoints: number;
          averageTime: string;
        };
      }>;
    };
  }>;
  userPerformance: Array<{
    user: QuizUser;
    stats: {
      totalAnswers: number;
      correctAnswers: number;
      accuracy: string;
      totalPoints: number;
      averageTime: string;
    };
  }>;
  timeAnalytics: {
    averageResponseTime: string;
    fastestResponse: string;
    slowestResponse: string;
    timeDistribution: number[];
  };
}

export interface QuizAnalyticsResponse {
  success: boolean;
  data: QuizAnalyticsData;
  message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useQuizzes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Create a new quiz
  const createQuiz = useCallback(async (quizData: CreateQuizRequest): Promise<Quiz | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Creating quiz with data:', quizData); // Debug log
      const response = await api.post<QuizResponse>('/quizzes', quizData);
      console.log('Quiz creation response:', response.data); // Debug log
      
      if (response.data.success) {
        // Refresh quizzes list after creation
        await fetchQuizzes();
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create quiz');
      }
    } catch (err: any) {
      console.error('Quiz creation error:', err); // Debug log
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create quiz';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all quizzes (admin endpoint)
  const fetchQuizzes = useCallback(async (): Promise<Quiz[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching quizzes...'); // Debug log
      const response = await api.get<QuizzesListResponse>('/quizzes');
      console.log('Quizzes response:', response.data); // Debug log
      
      if (response.data.success) {
        setQuizzes(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch quizzes');
      }
    } catch (err: any) {
      console.error('Quizzes fetch error:', err); // Debug log
      
      let errorMessage = 'Failed to fetch quizzes';
      
      // Handle specific error cases
      if (err.response?.status === 404) {
        errorMessage = 'Quiz management endpoint not available. Please check if the backend supports admin quiz operations.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Admin permissions required to view all quizzes.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in with admin credentials.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a single quiz by ID
  const getQuizById = useCallback(async (quizId: string): Promise<Quiz | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<QuizResponse>(`/quizzes/${quizId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to fetch quiz');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch quiz';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Declare winner for a quiz
  const declareWinner = useCallback(async (quizId: string, teamId: string): Promise<Quiz | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Declaring winner for quiz:', quizId, 'team:', teamId); // Debug log
      const response = await api.post<DeclareWinnerResponse>(`/quizzes/${quizId}/declare-winner`, {
        teamId: teamId
      });
      
      if (response.data.success) {
        // Refresh quizzes list after declaring winner
        await fetchQuizzes();
        return response.data.data;
      } else {
        throw new Error('Failed to declare winner');
      }
    } catch (err: any) {
      console.error('Declare winner error:', err); // Debug log
      const errorMessage = err.response?.data?.message || 'Failed to declare winner';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update quiz (using the correct endpoint)
  const updateQuiz = useCallback(async (quizId: string, quizData: UpdateQuizRequest): Promise<Quiz | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Updating quiz:', quizId, quizData); // Debug log
      const response = await api.put<QuizResponse>(`/quizzes/${quizId}`, quizData);
      console.log('Quiz update response:', response.data); // Debug log
      
      if (response.data.success) {
        // Refresh quizzes list after update
        await fetchQuizzes();
        return response.data.data;
      } else {
        throw new Error('Failed to update quiz');
      }
    } catch (err: any) {
      console.error('Quiz update error:', err); // Debug log
      const errorMessage = err.response?.data?.message || 'Failed to update quiz';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a specific question in a quiz
  const updateQuestion = useCallback(async (quizId: string, questionId: string, questionData: UpdateQuestionRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Updating question:', quizId, questionId, questionData); // Debug log
      const response = await api.put(`/quizzes/${quizId}/questions/${questionId}`, questionData);
      console.log('Question update response:', response.data); // Debug log
      
      if (response.status === 200 || response.status === 201) {
        // Refresh quizzes list after question update
        await fetchQuizzes();
        return true;
      } else {
        throw new Error('Failed to update question');
      }
    } catch (err: any) {
      console.error('Question update error:', err); // Debug log
      const errorMessage = err.response?.data?.message || 'Failed to update question';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete quiz (if API supports it)
  const deleteQuiz = useCallback(async (quizId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.delete(`/quizzes/${quizId}`);
      
      if (response.status === 200 || response.status === 204) {
        // Refresh quizzes list after deletion
        await fetchQuizzes();
        return true;
      } else {
        throw new Error('Failed to delete quiz');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete quiz';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Force delete quiz (admin only - can delete active quizzes)
  const forceDeleteQuiz = useCallback(async (quizId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Force deleting quiz:', quizId); // Debug log
      const response = await api.delete(`/quizzes/${quizId}/force`);
      console.log('Force delete response:', response); // Debug log
      
      if (response.status === 200 || response.status === 204) {
        // Refresh quizzes list after force deletion
        await fetchQuizzes();
        return true;
      } else {
        throw new Error('Failed to force delete quiz');
      }
    } catch (err: any) {
      console.error('Force delete error:', err); // Debug log
      let errorMessage = 'Failed to force delete quiz';
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        errorMessage = 'Access denied. Admin permissions required to force delete quizzes.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in with admin credentials.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Quiz not found or force delete endpoint not available.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get quiz results
  const getQuizResults = useCallback(async (quizId: string): Promise<any | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching quiz results for:', quizId); // Debug log
      const response = await api.get(`/quizzes/${quizId}/results`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to fetch quiz results');
      }
    } catch (err: any) {
      console.error('Get quiz results error:', err); // Debug log
      const errorMessage = err.response?.data?.message || 'Failed to fetch quiz results';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Publish quiz results (if API supports it)
  const publishResults = useCallback(async (quizId: string): Promise<Quiz | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<QuizResponse>(`/quizzes/${quizId}/publish-results`);
      
      if (response.data.success) {
        // Refresh quizzes list after publishing results
        await fetchQuizzes();
        return response.data.data;
      } else {
        throw new Error('Failed to publish results');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to publish results';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get quiz statistics
  const getQuizStats = useCallback((quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return null;

    return {
      totalQuestions: quiz.totalQuestions,
      totalParticipants: quiz.totalParticipants,
      totalTeams: quiz.totalTeams,
      questionsPerParticipant: quiz.questionsPerParticipant,
      averageScore: quiz.totalParticipants > 0 ? (quiz.questions.reduce((sum, q) => sum + q.points, 0) / quiz.totalParticipants) : 0,
      completionRate: quiz.totalTeams > 0 ? (quiz.totalParticipants / quiz.totalTeams) * 100 : 0,
      status: quiz.status,
      isResultPublished: quiz.isResultPublished,
      winningTeam: quiz.winningTeam,
    };
  }, [quizzes]);

  // Format quiz date for display
  const formatQuizDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Get quiz status color
  const getQuizStatusColor = useCallback((status: string) => {
    switch (status.toUpperCase()) {
      case 'UPCOMING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get team rankings for a quiz
  const getTeamRankings = useCallback(async (quizId: string): Promise<TeamRankingItem[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Getting team rankings for quiz:', quizId); // Debug log
      const response = await api.get(`/quizzes/${quizId}/rankings`);
      console.log('Team rankings response:', response.data); // Debug log
      
      if (response.data.success) {
        // Handle the actual API response structure: data.rankings
        const rankings = response.data.data?.rankings || [];
        console.log('Extracted rankings:', rankings); // Debug log
        
        if (!Array.isArray(rankings)) {
          console.warn('Rankings is not an array:', rankings);
          return [];
        }
        
        // Transform the data to match our interface
        const normalizedRankings = rankings.map((ranking: any, index: number) => ({
          rank: ranking.rank || index + 1,
          team: {
            id: ranking.team?.id || `team-${index}`,
            name: ranking.team?.name || `Team ${index + 1}`,
            description: ranking.team?.description || '',
            score: ranking.team?.score || ranking.score || 0,
            createdAt: ranking.team?.createdAt || '',
            updatedAt: ranking.team?.updatedAt || ''
          },
          score: ranking.score || ranking.team?.score || 0,
          totalQuestions: ranking.totalQuestions || 0,
          correctAnswers: ranking.correctAnswers || 0,
          averageTime: ranking.averageTime || 0
        }));
        
        console.log('Normalized rankings:', normalizedRankings); // Debug log
        return normalizedRankings;
      } else {
        throw new Error(response.data.message || 'Failed to get team rankings');
      }
    } catch (err: any) {
      console.error('Get team rankings error:', err); // Debug log
      
      // More detailed error logging
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get team rankings';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get quiz analytics dashboard data
  const getQuizAnalytics = useCallback(async (quizId?: string): Promise<QuizAnalyticsData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching quiz analytics...'); // Debug log
      
      // Use specific quiz ID if provided, otherwise get dashboard analytics
      const endpoint = quizId 
        ? `/quiz-analytics/${quizId}` 
        : '/quiz-analytics/dashboard';
      
      const response = await api.get<QuizAnalyticsResponse>(endpoint);
      console.log('Quiz analytics response:', response.data); // Debug log
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch quiz analytics');
      }
    } catch (err: any) {
      console.error('Get quiz analytics error:', err); // Debug log
      
      // More detailed error logging
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch quiz analytics';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    quizzes,
    createQuiz,
    fetchQuizzes,
    fetchMyQuizzes: fetchQuizzes, // Keep both names for compatibility
    getQuizById,
    declareWinner,
    getTeamRankings,
    getQuizAnalytics,
    updateQuiz,
    updateQuestion,
    deleteQuiz,
    forceDeleteQuiz,
    getQuizResults,
    publishResults,
    getQuizStats,
    formatQuizDate,
    getQuizStatusColor,
    clearError,
    // NEW FUNCTIONS - Quiz Management
    addQuestionToQuiz: useCallback(async (quizId: string, questionData: {
      question: string;
      options: string[];
      correctAnswer: number;
      points: number;
      timeLimit: number;
    }): Promise<boolean> => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.post(`/quizzes/${quizId}/questions`, questionData);
        if (response.data.success) {
          return true;
        } else {
          throw new Error(response.data.message || 'Failed to add question');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to add question';
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    }, []),

    activateQuiz: useCallback(async (quizId: string): Promise<Quiz | null> => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.patch(`/quizzes/${quizId}/activate`);
        if (response.data.success) {
          // Refresh quizzes list after activation
          await fetchQuizzes();
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to activate quiz');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to activate quiz';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    }, []),
  };
};