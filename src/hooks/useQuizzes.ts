// hooks/useQuizzes.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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
      const errorMessage = err.response?.data?.message || 'Failed to fetch quizzes';
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
  const declareWinner = useCallback(async (quizId: string): Promise<Quiz | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<DeclareWinnerResponse>(`/quizzes/${quizId}/declare-winner`);
      
      if (response.data.success) {
        // Refresh quizzes list after declaring winner
        await fetchQuizzes();
        return response.data.data;
      } else {
        throw new Error('Failed to declare winner');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to declare winner';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update quiz (if API supports it)
  const updateQuiz = useCallback(async (quizId: string, quizData: Partial<CreateQuizRequest>): Promise<Quiz | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put<QuizResponse>(`/quizzes/${quizId}`, quizData);
      
      if (response.data.success) {
        // Refresh quizzes list after update
        await fetchQuizzes();
        return response.data.data;
      } else {
        throw new Error('Failed to update quiz');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update quiz';
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

  return {
    loading,
    error,
    quizzes,
    createQuiz,
    fetchQuizzes,
    fetchMyQuizzes: fetchQuizzes, // Keep both names for compatibility
    getQuizById,
    declareWinner,
    updateQuiz,
    deleteQuiz,
    publishResults,
    getQuizStats,
    formatQuizDate,
    getQuizStatusColor,
    clearError,
  };
};