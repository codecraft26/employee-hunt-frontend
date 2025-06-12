// hooks/useUserQuizzes.ts
'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

// Types
export interface UserQuiz {
  id: string;
  title: string;
  description: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  startTime: string;
  endTime: string;
  resultDisplayTime: string;
  isResultPublished: boolean;
  totalQuestions: number;
  questionsPerParticipant: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  timeLimit: number;
  isCompleted: boolean;
  userAnswer?: number;
  isCorrect?: boolean;
  score?: number;
}

export interface TeamRanking {
  teamId: string;
  teamName: string;
  totalScore: number;
  completedQuestions: number;
  rank: number;
}

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useUserQuizzes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<UserQuiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<UserQuiz | null>(null);
  const [assignedQuestions, setAssignedQuestions] = useState<UserQuizQuestion[]>([]);
  const [teamRankings, setTeamRankings] = useState<TeamRanking[]>([]);

  // Fetch user's assigned quizzes
  const fetchMyQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/quizzes/my-quizzes');
      if (response.data.success) {
        setQuizzes(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch quizzes');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get quiz by ID
  const getQuizById = useCallback(async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      if (response.data.success) {
        setCurrentQuiz(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch quiz');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch quiz');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get assigned questions for a quiz
  const getAssignedQuestions = useCallback(async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/quizzes/${quizId}/questions`);
      if (response.data.success) {
        setAssignedQuestions(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch questions');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch questions');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit answer for a question
  const submitAnswer = useCallback(async (quizId: string, questionId: string, answer: { selectedOption: number; timeTaken: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/quizzes/${quizId}/questions/${questionId}/submit`, answer);
      if (response.data.success) {
        // Update the question in assignedQuestions
        setAssignedQuestions(prev => 
          prev.map(q => q.id === questionId ? { ...q, ...response.data.data } : q)
        );
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to submit answer');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit answer');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get team rankings for a quiz
  const getTeamRankings = useCallback(async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/quizzes/${quizId}/rankings`);
      if (response.data.success) {
        setTeamRankings(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch rankings');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch rankings');
      return [];
    } finally {
      setLoading(false);
    }
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Format quiz date
  const formatQuizDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Get quiz progress
  const getQuizProgress = useCallback((quiz: UserQuiz) => {
    const completedQuestions = assignedQuestions.filter(q => q.isCompleted).length;
    const totalQuestions = assignedQuestions.length;
    const progress = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;

    return {
      completed: completedQuestions,
      total: totalQuestions,
      progress: Math.round(progress),
      isCompleted: completedQuestions === totalQuestions && totalQuestions > 0
    };
  }, [assignedQuestions]);

  // Check if quiz can be started
  const canStartQuiz = useCallback((quiz: UserQuiz) => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);
    
    return now >= startTime && now <= endTime && quiz.status === 'ACTIVE';
  }, []);

  // Check if quiz is expired
  const isQuizExpired = useCallback((quiz: UserQuiz) => {
    const now = new Date();
    const endTime = new Date(quiz.endTime);
    return now > endTime;
  }, []);

  // Get quiz display status
  const getQuizDisplayStatus = useCallback((quiz: UserQuiz) => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);
    
    if (now < startTime) return 'UPCOMING';
    if (now > endTime) return 'EXPIRED';
    return quiz.status;
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setCurrentQuiz(null);
    setAssignedQuestions([]);
    setTeamRankings([]);
    setError(null);
  }, []);

  return {
    loading,
    error,
    quizzes,
    currentQuiz,
    assignedQuestions,
    teamRankings,
    fetchMyQuizzes,
    getQuizById,
    getAssignedQuestions,
    submitAnswer,
    getTeamRankings,
    getQuizStatusColor,
    formatQuizDate,
    getQuizProgress,
    canStartQuiz,
    isQuizExpired,
    getQuizDisplayStatus,
    clearError,
    resetState
  };
};