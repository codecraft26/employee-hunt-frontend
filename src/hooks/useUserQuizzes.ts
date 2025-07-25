// hooks/useUserQuizzes.ts
'use client';

import { useState, useCallback } from 'react';
import { UserQuizWithCompletion, QuizCompletionStatus } from '../types/quizCompletion';
import axios from 'axios';
import Cookies from 'js-cookie';

// Types
export interface UserQuiz {
  id: string;
  title: string;
  description: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  questionOrderMode?: 'SEQUENTIAL' | 'RANDOM';
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
  questionOrderMode: 'SEQUENTIAL' | 'RANDOM';
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
  // quizzesWithCompletion: [{ quiz, completionStatus, canAccess, message }]
  const [quizzesWithCompletion, setQuizzesWithCompletion] = useState<UserQuizWithCompletion[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<UserQuiz | null>(null);
  const [assignedQuestions, setAssignedQuestions] = useState<UserQuizQuestion[]>([]);
  const [teamRankings, setTeamRankings] = useState<TeamRanking[]>([]);

  // Fetch user's quizzes with completion status and access control
  const fetchMyQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/quizzes/my-quizzes');
      if (response.data.success) {
        setQuizzesWithCompletion(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch quizzes');
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
      console.log('Fetching assigned questions for quiz:', quizId); // Debug log
      // Check if user has authentication
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      const response = await api.get(`/quizzes/${quizId}/assigned-questions`);
      console.log('Assigned questions response:', response.data); // Debug log
      if (response.data.success) {
        let questions = response.data.data;
        // Block access if any question has isAccessClosed true
        if (questions && questions.some((q: any) => q.isAccessClosed)) {
          setError('Quiz access has been closed. You cannot continue this quiz.');
          setAssignedQuestions([]);
          return [];
        }
        // Check if backend already shuffled or if we need to shuffle client-side
        if (questions && questions.length > 0) {
          const orderMode = questions[0]?.quiz?.questionOrderMode;
          console.log('Question order mode:', orderMode); // Debug log
          console.log('Questions received from API (in order):', questions.map(q => ({ id: q.question.id, order: questions.indexOf(q) }))); // Debug log
          
          if (orderMode && orderMode.toUpperCase() === 'RANDOM') {
            console.log('⚠️ WARNING: Quiz is set to RANDOM but we are shuffling client-side. This should ideally be done server-side for consistency.'); // Debug log
            console.log('Shuffling questions for random order'); // Debug log
            
            // Create a copy to avoid mutating the original array
            const shuffledQuestions = [...questions];
            
            // Fisher-Yates shuffle algorithm
            for (let i = shuffledQuestions.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
            }
            
            console.log('Questions after shuffle:', shuffledQuestions.map(q => ({ id: q.question.id, order: shuffledQuestions.indexOf(q) }))); // Debug log
            questions = shuffledQuestions;
          } else {
            console.log('Using sequential order (no shuffle needed):', orderMode); // Debug log
          }
        }
        setAssignedQuestions(questions || []);
        return questions || [];
      } else {
        const errorMessage = response.data.message || 'Failed to fetch questions';
        console.error('API returned error:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error('Get assigned questions error:', err); // Debug log
      let errorMessage = 'Failed to fetch questions';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You are not authorized to access this quiz. Please ensure you are assigned to a team.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Quiz not found or no questions assigned to you.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark a quiz as completed in local state
  const markQuizAsCompleted = useCallback((quizId: string) => {
    setQuizzesWithCompletion(prev => 
      prev.map(item => 
        item.quiz.id === quizId 
          ? {
              ...item,
              completionStatus: {
                ...item.completionStatus,
                isCompleted: true,
                completionPercentage: 100,
                completedCount: item.completionStatus?.totalAssigned || 0,
                remainingCount: 0
              }
            }
          : item
      )
    );
  }, []);

  // Close quiz access for a user
  const closeQuizAccess = useCallback(async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/quizzes/${quizId}/close-access`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to close quiz access');
      }
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to close quiz access');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user has completed all questions for a quiz
  const isQuizCompleted = useCallback(async (quizId: string): Promise<boolean> => {
    try {
      const questions = await getAssignedQuestions(quizId);
      if (!questions || questions.length === 0) {
        return false;
      }
      
      // Check if all questions are completed
      const completedCount = questions.filter((q: any) => q.isCompleted).length;
      return completedCount === questions.length;
    } catch (error) {
      console.error('Error checking quiz completion:', error);
      return false;
    }
  }, [getAssignedQuestions]);

  // Check if a question has already been answered
  const isQuestionAnswered = useCallback((questionId: string): boolean => {
    const question = assignedQuestions.find(q => q.question.id === questionId);
    return question?.isCompleted || false;
  }, [assignedQuestions]);

  // Submit answer for a question
  const submitAnswer = useCallback(async (quizId: string, questionId: string, answerData: { selectedOption: number; timeTaken: number }) => {
    setLoading(true);
    setError(null);
    
    // Pre-check if question is already answered
    if (isQuestionAnswered(questionId)) {
      console.log('Question already answered locally, skipping submission');
      setLoading(false);
      return {
        success: true,
        isCorrect: false, // Unknown since it was already answered
        pointsEarned: 0,
        selectedOption: answerData.selectedOption
      };
    }
    
    try {
      console.log('Submitting answer:', { quizId, questionId, answerData }); // Debug log
      
      // Send data directly to match backend expectations
      const requestBody = {
        selectedOption: answerData.selectedOption,
        timeTaken: answerData.timeTaken
      };
      
      console.log('Request body:', requestBody); // Debug log
      
      const response = await api.post(`/quizzes/${quizId}/questions/${questionId}/answer`, requestBody);
      console.log('🔍 Full backend response:', response.data);
      console.log('🔍 Response data fields:', Object.keys(response.data.data || {}));
      console.log('🔍 Response data values:', response.data.data);
      
      if (response.data.success) {
        console.log('✅ Answer submitted successfully to backend:', { questionId, response: response.data.data }); // Debug log
        
        // Update the question in assignedQuestions
        setAssignedQuestions(prev => {
          const updated = prev.map(q => q.question.id === questionId ? { 
            ...q, 
            isCompleted: true,
            answer: answerData.selectedOption,
            userAnswer: answerData.selectedOption,
            timeTaken: answerData.timeTaken,
            isCorrect: response.data.data.isCorrect || false,
            score: response.data.data.score || 0
          } : q);
          
          console.log('📝 Updated assignedQuestions state:', updated.map(q => ({ 
            id: q.question.id, 
            isCompleted: q.isCompleted, 
            userAnswer: q.userAnswer 
          }))); // Debug log
          
          return updated;
        });
        
        // Return the response data for immediate feedback
        return {
          success: true,
          isCorrect: response.data.data.isCorrect || false,
          pointsEarned: response.data.data.pointsEarned || response.data.data.score || 0,
          selectedOption: answerData.selectedOption
        };
      } else {
        throw new Error(response.data.message || 'Failed to submit answer');
      }
    } catch (err: any) {
      console.error('Submit answer error:', err); // Debug log
      console.error('Error response:', err.response?.data); // Debug log
      
      const errorMessage = err.response?.data?.message || 'Failed to submit answer';
      
      // Handle "already answered" case gracefully
      if (errorMessage?.includes('already answered')) {
        console.log('Question already answered, marking as completed');
        
        // Mark the question as completed even though we got an error
        setAssignedQuestions(prev => 
          prev.map(q => q.question.id === questionId ? { 
            ...q, 
            isCompleted: true,
            answer: answerData.selectedOption,
            userAnswer: answerData.selectedOption,
            timeTaken: answerData.timeTaken
          } : q)
        );
        
        // Return success data since the question is effectively answered
        return {
          success: true,
          isCorrect: false, // Unknown since it was already answered
          pointsEarned: 0,
          selectedOption: answerData.selectedOption
        };
      }
      
      setError(errorMessage);
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

  // Get quiz results (if published)
  const getQuizResults = useCallback(async (quizId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/quizzes/${quizId}/results`);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch quiz results');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch quiz results');
      throw err;
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
    quizzesWithCompletion,
    currentQuiz,
    assignedQuestions,
    teamRankings,
    fetchMyQuizzes,
    getQuizById,
    getAssignedQuestions,
    submitAnswer,
    isQuestionAnswered,
    isQuizCompleted,
    getTeamRankings,
    getQuizResults,
    getQuizStatusColor,
    formatQuizDate,
    getQuizProgress,
    canStartQuiz,
    isQuizExpired,
    getQuizDisplayStatus,
    clearError,
    resetState,
    closeQuizAccess,
    markQuizAsCompleted,
  };
};