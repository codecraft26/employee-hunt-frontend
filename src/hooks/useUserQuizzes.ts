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
  isCompleted: boolean;
  maxScore: number;
  totalParticipants: number;
  userScore: number;
  winningTeam?: {
    name: string;
  } | null;
  teamRank?: number;
  totalTeams?: number;
}

export interface QuestionData {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  timeLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizData {
  id: string;
  title: string;
  description: string;
  status: string;
  questionDistributionType: string;
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
}

export interface UserQuizQuestion {
  id: string;
  isCompleted: boolean;
  score: number;
  timeTaken: number;
  answer: number | null;
  isCorrect: boolean;
  createdAt: string;
  updatedAt: string;
  question: QuestionData;
  quiz: QuizData;
  status: string;
  message: string;
  userAnswer?: number;
}

export interface TeamRanking {
  teamId: string;
  teamName: string;
  totalScore: number;
  completedQuestions: number;
  rank: number;
  completedParticipants?: number;
  totalParticipants?: number;
  averageScore?: number;
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
      // Try different endpoints in order of preference
      let response;
      
      try {
        // First try the user-specific endpoint
        response = await api.get('/quizzes/my-quizzes');
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 400) {
          // If that fails, try the general quizzes endpoint
          console.log('User-specific quizzes endpoint not found, trying general endpoint...');
          response = await api.get('/quizzes');
        } else {
          throw err;
        }
      }
      
      if (response.data.success) {
        setQuizzes(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch quizzes');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch quizzes';
      setError(errorMessage);
      console.error('Quizzes fetch error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
      
      // For development, provide mock data if API is not available
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock quizzes data for development...');
        const mockQuizzes: UserQuiz[] = [
          {
            id: '1',
            title: 'Weekly Knowledge Quiz',
            description: 'Test your knowledge about company policies and procedures.',
            status: 'ACTIVE',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            resultDisplayTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            isResultPublished: false,
            totalQuestions: 10,
            questionsPerParticipant: 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCompleted: false,
            maxScore: 50,
            totalParticipants: 25,
            userScore: 0,
            teamRank: 1,
            totalTeams: 5
          },
          {
            id: '2',
            title: 'Team Building Quiz',
            description: 'Fun quiz to test team collaboration and communication.',
            status: 'UPCOMING',
            startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
            endTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days from now
            resultDisplayTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
            isResultPublished: false,
            totalQuestions: 15,
            questionsPerParticipant: 8,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCompleted: false,
            maxScore: 80,
            totalParticipants: 30,
            userScore: 0,
            teamRank: 2,
            totalTeams: 6
          }
        ];
        setQuizzes(mockQuizzes);
        return;
      }
      
      // Return empty array as fallback to prevent UI from breaking
      setQuizzes([]);
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
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch quiz';
      setError(errorMessage);
      console.error('Quiz fetch error:', err);
      
      // For development, provide mock quiz data
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock quiz data for development...');
        const mockQuiz: UserQuiz = {
          id: quizId,
          title: 'Mock Quiz',
          description: 'This is a mock quiz for development purposes.',
          status: 'ACTIVE',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          resultDisplayTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isResultPublished: false,
          totalQuestions: 5,
          questionsPerParticipant: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCompleted: false,
          maxScore: 30,
          totalParticipants: 20,
          userScore: 0,
          teamRank: 1,
          totalTeams: 4
        };
        setCurrentQuiz(mockQuiz);
        return mockQuiz;
      }
      
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
      const response = await api.get(`/quizzes/${quizId}/assigned-questions`);
      if (response.data.success) {
        setAssignedQuestions(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch questions');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch questions';
      setError(errorMessage);
      console.error('Questions fetch error:', err);
      
      // For development, provide mock questions data
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock questions data for development...');
        const mockQuestions: UserQuizQuestion[] = [
          {
            id: 'q1',
            isCompleted: false,
            score: 0,
            timeTaken: 0,
            answer: null,
            isCorrect: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            question: {
              id: 'question1',
              question: 'What is the capital of France?',
              options: ['London', 'Berlin', 'Paris', 'Madrid'],
              correctAnswer: 2,
              points: 10,
              timeLimit: 30,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            quiz: {
              id: quizId,
              title: 'Mock Quiz',
              description: 'Mock quiz for development',
              status: 'ACTIVE',
              questionDistributionType: 'RANDOM',
              startTime: new Date().toISOString(),
              endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              resultDisplayTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              isResultPublished: false,
              totalTeams: 4,
              totalParticipants: 20,
              totalQuestions: 5,
              questionsPerParticipant: 3,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            status: 'PENDING',
            message: 'Question ready to answer'
          },
          {
            id: 'q2',
            isCompleted: false,
            score: 0,
            timeTaken: 0,
            answer: null,
            isCorrect: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            question: {
              id: 'question2',
              question: 'Which programming language is this app built with?',
              options: ['JavaScript', 'Python', 'Java', 'C++'],
              correctAnswer: 0,
              points: 10,
              timeLimit: 30,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            quiz: {
              id: quizId,
              title: 'Mock Quiz',
              description: 'Mock quiz for development',
              status: 'ACTIVE',
              questionDistributionType: 'RANDOM',
              startTime: new Date().toISOString(),
              endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              resultDisplayTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              isResultPublished: false,
              totalTeams: 4,
              totalParticipants: 20,
              totalQuestions: 5,
              questionsPerParticipant: 3,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            status: 'PENDING',
            message: 'Question ready to answer'
          }
        ];
        setAssignedQuestions(mockQuestions);
        return mockQuestions;
      }
      
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
      const response = await api.post(`/quizzes/${quizId}/questions/${questionId}/answer`, answer);
      if (response.data.success) {
        // Update the question in assignedQuestions
        setAssignedQuestions(prev => 
          prev.map(q => q.id === questionId ? { 
            ...q, 
            isCompleted: true,
            answer: answer.selectedOption,
            userAnswer: answer.selectedOption,
            timeTaken: answer.timeTaken,
            isCorrect: response.data.data.isCorrect || false,
            score: response.data.data.score || 0
          } : q)
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
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
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
    const percentage = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;

    return {
      completed: completedQuestions,
      total: totalQuestions,
      percentage: Math.round(percentage),
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