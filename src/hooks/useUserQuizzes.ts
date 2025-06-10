// hooks/useUserQuizzes.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export interface UserQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: number; // Only visible after submission
  points: number;
  timeLimit: number;
  userAnswer?: number | null;
  timeTaken?: number;
  isCorrect?: boolean;
  score?: number;
  isCompleted: boolean;
  assignmentId?: string; // Assignment ID from API response
}

// API response interfaces
interface APIQuestionData {
  id: string;
  question: string;
  options: string[];
  points: number;
  timeLimit: number;
}

interface APIAssignedQuestion {
  id: string; // assignment ID
  question: APIQuestionData;
  isCompleted: boolean;
  score: number;
  timeTaken: number;
  answer: number | null;
  isCorrect: boolean;
}

export interface UserQuiz {
  id: string;
  title: string;
  description: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'DRAFT' | 'EXPIRED';
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
  userScore?: number;
  maxScore?: number;
  isCompleted: boolean;
  canStart: boolean;
  teamRank?: number;
  questions?: UserQuizQuestion[];
  winningTeam?: {
    id: string;
    name: string;
  };
}

export interface TeamRanking {
  teamId: string;
  teamName: string;
  totalScore: number;
  averageScore: number;
  completedParticipants: number;
  totalParticipants: number;
  rank: number;
}

export interface QuizResults {
  quiz: UserQuiz;
  userScore: number;
  maxScore: number;
  teamRank: number;
  totalTeams: number;
  accuracy: number;
  timeTaken: number;
}

export interface SubmitAnswerRequest {
  selectedOption: number; // Changed from 'answer' to match API
  timeTaken: number;
}

export interface UserQuizzesResponse {
  success: boolean;
  data: UserQuiz[];
}

export interface UserQuizResponse {
  success: boolean;
  data: {
    quiz: UserQuiz & {
      winningTeam?: {
        id: string;
        name: string;
      };
      questions?: Array<{
        id: string;
        question: string;
        options: string[];
        correctAnswer: number;
        points: number;
        timeLimit: number;
      }>;
    };
    userScore?: {
      totalScore: number;
      correctAnswers: number;
      totalQuestions: number;
    };
  };
}

export interface AssignedQuestionsResponse {
  success: boolean;
  data: APIAssignedQuestion[];
}

export interface SubmitAnswerResponse {
  success: boolean;
  data: {
    id: string; // Assignment ID
    isCompleted: boolean;
    score: number; // Points earned (not pointsEarned)
    timeTaken: number;
    answer: number;
    isCorrect: boolean;
    question: {
      id: string;
      question: string;
      options: string[];
      correctAnswer: number;
      points: number;
      timeLimit: number;
    };
    quiz: {
      id: string;
      title: string;
    };
  };
}

export interface TeamRankingsResponse {
  success: boolean;
  data: TeamRanking[];
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

// Helper function to transform API assigned questions to UserQuizQuestion format
const transformAssignedQuestions = (apiQuestions: APIAssignedQuestion[]): UserQuizQuestion[] => {
  return apiQuestions.map(apiQuestion => ({
    id: apiQuestion.question.id, // Use the actual question ID
    question: apiQuestion.question.question,
    options: apiQuestion.question.options,
    points: apiQuestion.question.points,
    timeLimit: apiQuestion.question.timeLimit,
    userAnswer: apiQuestion.answer !== null ? Number(apiQuestion.answer) : null, // Ensure number type
    timeTaken: apiQuestion.timeTaken || 0,
    isCorrect: Boolean(apiQuestion.isCorrect), // Ensure boolean type
    score: Number(apiQuestion.score || 0), // Ensure number type
    isCompleted: Boolean(apiQuestion.isCompleted), // Ensure boolean type
    // Store assignment ID separately if needed
    assignmentId: apiQuestion.id
  }));
};

export const useUserQuizzes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<UserQuiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<UserQuiz | null>(null);
  const [assignedQuestions, setAssignedQuestions] = useState<UserQuizQuestion[]>([]);
  const [teamRankings, setTeamRankings] = useState<TeamRanking[]>([]);

  // Fetch all user's quizzes
  const fetchMyQuizzes = useCallback(async (): Promise<UserQuiz[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching user quizzes...'); // Debug log
      const response = await api.get<UserQuizzesResponse>('/quizzes/my-quizzes');
      console.log('User quizzes response:', response.data); // Debug log
      
      if (response.data.success) {
        setQuizzes(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch quizzes');
      }
    } catch (err: any) {
      console.error('User quizzes fetch error:', err); // Debug log
      const errorMessage = err.response?.data?.message || 'Failed to fetch quizzes';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific quiz by ID
  const getQuizById = useCallback(async (quizId: string): Promise<UserQuiz | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching quiz:', quizId); // Debug log
      const response = await api.get<UserQuizResponse>(`/quizzes/${quizId}`);
      console.log('Quiz response:', response.data); // Debug log
      
      if (response.data.success) {
        // Extract quiz data and user score from response
        const quizData = response.data.data.quiz;
        const userScore = response.data.data.userScore;
        
        // Enhance quiz with user score data
        const enhancedQuiz: UserQuiz = {
          ...quizData,
          userScore: userScore?.totalScore,
          maxScore: userScore?.totalQuestions ? userScore.totalQuestions * 10 : undefined, // Assuming 10 points per question
          isCompleted: userScore ? userScore.correctAnswers > 0 || userScore.totalScore > 0 : false,
          winningTeam: quizData.winningTeam
        };
        
        setCurrentQuiz(enhancedQuiz);
        return enhancedQuiz;
      } else {
        throw new Error('Failed to fetch quiz');
      }
    } catch (err: any) {
      console.error('Quiz fetch error:', err); // Debug log
      const errorMessage = err.response?.data?.message || 'Failed to fetch quiz';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get assigned questions for a quiz
  const getAssignedQuestions = useCallback(async (quizId: string): Promise<UserQuizQuestion[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching assigned questions for quiz:', quizId); // Debug log
      const response = await api.get<AssignedQuestionsResponse>(`/quizzes/${quizId}/assigned-questions`);
      console.log('Assigned questions response:', response.data); // Debug log
      
      if (response.data.success) {
        // Transform the API response to match our expected format
        const transformedQuestions = transformAssignedQuestions(response.data.data);
        console.log('Transformed questions:', transformedQuestions); // Debug log
        
        setAssignedQuestions(transformedQuestions);
        return transformedQuestions;
      } else {
        throw new Error('Failed to fetch assigned questions');
      }
    } catch (err: any) {
      console.error('Assigned questions fetch error:', err); // Debug log
      const errorMessage = err.response?.data?.message || 'Failed to fetch assigned questions';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit an answer for a question
  const submitAnswer = useCallback(async (
    quizId: string, 
    questionId: string, 
    answerData: SubmitAnswerRequest
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Submitting answer:', { quizId, questionId, answerData }); // Debug log
      const response = await api.post<SubmitAnswerResponse>(
        `/quizzes/${quizId}/questions/${questionId}/answer`,
        answerData
      );
      console.log('Submit answer response:', response.data); // Debug log
      
      if (response.data.success) {
        // Update the assigned questions with the new answer
        setAssignedQuestions(prev => 
          prev.map(q => 
            q.id === questionId 
              ? {
                  ...q,
                  userAnswer: Number(answerData.selectedOption),
                  timeTaken: answerData.timeTaken,
                  isCorrect: response.data.data.isCorrect,
                  score: response.data.data.score,
                  correctAnswer: Number(response.data.data.question.correctAnswer),
                  isCompleted: true
                }
              : q
          )
        );
        return true;
      } else {
        throw new Error('Failed to submit answer');
      }
    } catch (err: any) {
      console.error('Submit answer error:', err); // Debug log
      const errorMessage = err.response?.data?.message || 'Failed to submit answer';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get team rankings for a quiz
  const getTeamRankings = useCallback(async (quizId: string): Promise<TeamRanking[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching team rankings for quiz:', quizId); // Debug log
      const response = await api.get<TeamRankingsResponse>(`/quizzes/${quizId}/rankings`);
      console.log('Team rankings response:', response.data); // Debug log
      
      if (response.data.success) {
        setTeamRankings(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch team rankings');
      }
    } catch (err: any) {
      console.error('Team rankings fetch error:', err); // Debug log
      const errorMessage = err.response?.data?.message || 'Failed to fetch team rankings';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions
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
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

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

  const getQuizProgress = useCallback((quiz: UserQuiz) => {
    if (!quiz.questions) return { completed: 0, total: quiz.questionsPerParticipant, percentage: 0 };
    
    const completed = quiz.questions.filter(q => q.isCompleted).length;
    const total = quiz.questionsPerParticipant;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  }, []);

  const canStartQuiz = useCallback((quiz: UserQuiz) => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);
    
    return quiz.status === 'ACTIVE' && 
           now >= startTime && 
           now <= endTime && 
           !quiz.isCompleted;
  }, []);

  const isQuizExpired = useCallback((quiz: UserQuiz) => {
    const now = new Date();
    const endTime = new Date(quiz.endTime);
    
    // Only consider a quiz expired if the current time is past the end time
    // AND the quiz status is not already 'COMPLETED'
    return now > endTime && quiz.status !== 'COMPLETED';
  }, []);

  const getQuizDisplayStatus = useCallback((quiz: UserQuiz) => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);
    
    if (quiz.status === 'COMPLETED') {
      return 'COMPLETED';
    }
    
    if (now < startTime) {
      return 'UPCOMING';
    }
    
    if (now >= startTime && now <= endTime && quiz.status === 'ACTIVE') {
      return 'ACTIVE';
    }
    
    if (now > endTime) {
      return 'EXPIRED';
    }
    
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
    resetState,
  };
};