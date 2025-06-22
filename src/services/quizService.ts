import { apiService } from './apiService';
import {
  Quiz,
  CreateQuizRequest,
  UpdateQuizRequest,
  UpdateQuestionRequest,
  SubmitAnswerRequest,
  QuizResponse,
  QuizzesResponse,
  QuizAssignmentResponse,
  QuizAnswerResponse,
  RankingsResponse,
  PublishResultsResponse,
  DeclareWinnerResponse
} from '../types/quiz';

export const quizService = {
  // 1. Create Quiz (Admin Only)
  createQuiz: (quizData: CreateQuizRequest): Promise<QuizResponse> => {
    return apiService.post('/quizzes', quizData);
  },

  // 2. Get All Quizzes (Admin Only)
  getAllQuizzes: (): Promise<QuizzesResponse> => {
    return apiService.get('/quizzes');
  },

  // 3. Get Quiz by ID
  getQuizById: (quizId: string): Promise<QuizResponse> => {
    return apiService.get(`/quizzes/${quizId}`);
  },

  // 4. Get My Quizzes (User)
  getMyQuizzes: (): Promise<QuizzesResponse> => {
    return apiService.get('/quizzes/my-quizzes');
  },

  // 5. Get Assigned Questions
  getAssignedQuestions: (quizId: string): Promise<QuizAssignmentResponse> => {
    return apiService.get(`/quizzes/${quizId}/assigned-questions`);
  },

  // 6. Submit Answer
  submitAnswer: (quizId: string, questionId: string, answerData: SubmitAnswerRequest): Promise<QuizAnswerResponse> => {
    return apiService.post(`/quizzes/${quizId}/questions/${questionId}/answer`, answerData);
  },

  // 7. Get Team Rankings
  getTeamRankings: (quizId: string): Promise<RankingsResponse> => {
    return apiService.get(`/quizzes/${quizId}/rankings`);
  },

  // 8. Update Quiz (Admin Only)
  updateQuiz: (quizId: string, quizData: UpdateQuizRequest): Promise<QuizResponse> => {
    return apiService.put(`/quizzes/${quizId}`, quizData);
  },

  // 9. Update Question (Admin Only)
  updateQuestion: (quizId: string, questionId: string, questionData: UpdateQuestionRequest): Promise<QuizResponse> => {
    return apiService.put(`/quizzes/${quizId}/questions/${questionId}`, questionData);
  },

  // 10. Publish Results (Admin Only)
  publishResults: (quizId: string): Promise<PublishResultsResponse> => {
    return apiService.post(`/quizzes/${quizId}/publish-results`);
  },

  // 11. Declare Winner (Admin Only)
  declareWinner: (quizId: string, teamId: string): Promise<DeclareWinnerResponse> => {
    return apiService.post(`/quizzes/${quizId}/declare-winner`, { teamId });
  },

  // 12. Delete Quiz (Admin Only)
  deleteQuiz: (quizId: string): Promise<{ success: boolean; message: string }> => {
    return apiService.delete(`/quizzes/${quizId}`);
  },

  // 13. Force Delete Quiz (Admin Only - can delete active quizzes)
  forceDeleteQuiz: (quizId: string): Promise<{ success: boolean; message: string }> => {
    return apiService.delete(`/quizzes/${quizId}/force`);
  },

  // Additional helper methods

  // Get Quiz Statistics
  getQuizStats: (): Promise<{ success: boolean; data: any }> => {
    return apiService.get('/quizzes/stats');
  },

  // Get Active Quizzes
  getActiveQuizzes: (): Promise<QuizzesResponse> => {
    return apiService.get('/quizzes/active');
  },

  // Get Upcoming Quizzes
  getUpcomingQuizzes: (): Promise<QuizzesResponse> => {
    return apiService.get('/quizzes/upcoming');
  },

  // Get Completed Quizzes
  getCompletedQuizzes: (): Promise<QuizzesResponse> => {
    return apiService.get('/quizzes/completed');
  },

  // Get Quiz Results (if published)
  getQuizResults: (quizId: string): Promise<RankingsResponse> => {
    return apiService.get(`/quizzes/${quizId}/results`);
  },

  // Get User's Quiz Progress
  getUserQuizProgress: (quizId: string): Promise<{ success: boolean; data: any }> => {
    return apiService.get(`/quizzes/${quizId}/progress`);
  },

  // Bulk operations for quiz management
  bulkDeleteQuizzes: (quizIds: string[]): Promise<{ success: boolean; message: string }> => {
    return apiService.post('/quizzes/bulk-delete', { quizIds });
  },

  // Export quiz data
  exportQuizData: (quizId: string): Promise<{ success: boolean; data: any }> => {
    return apiService.get(`/quizzes/${quizId}/export`);
  },

  // Import quiz data
  importQuizData: (file: File): Promise<QuizResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post('/quizzes/import', formData);
  },

  // NEW ENDPOINTS - Quiz Management (Admin)

  // Add Question to Quiz
  addQuestionToQuiz: (quizId: string, questionData: {
    question: string;
    options: string[];
    correctAnswer: number;
    points: number;
    timeLimit: number;
  }): Promise<{ success: boolean; message: string; data: any }> => {
    return apiService.post(`/quizzes/${quizId}/questions`, questionData);
  },

  // Activate Quiz
  activateQuiz: (quizId: string): Promise<QuizResponse> => {
    return apiService.patch(`/quizzes/${quizId}/activate`);
  }
};

// NEW SERVICE - Quiz Analytics (Admin Only)
export const quizAnalyticsService = {
  // Get Dashboard Summary
  getDashboardSummary: (): Promise<{
    success: boolean;
    data: {
      overview: any;
      participation: any;
      trends: any;
      topQuizzes: any[];
      summary: any;
    };
  }> => {
    return apiService.get('/quiz-analytics/dashboard');
  },

  // Get Quiz Overview
  getOverview: (): Promise<{ success: boolean; data: any }> => {
    return apiService.get('/quiz-analytics/overview');
  },

  // Get Detailed Quiz Analytics
  getQuizAnalytics: (quizId: string): Promise<{
    success: boolean;
    data: {
      quiz: any;
      summary: any;
      questionAnalytics: any[];
      teamPerformance: any[];
      userPerformance: any[];
      timeAnalytics: any;
    };
  }> => {
    return apiService.get(`/quiz-analytics/quiz/${quizId}`);
  },

  // Get Question Analytics
  getQuestionAnalytics: (quizId: string): Promise<{
    success: boolean;
    data: any[];
  }> => {
    return apiService.get(`/quiz-analytics/quiz/${quizId}/questions`);
  },

  // Get Team Performance
  getTeamPerformance: (quizId: string): Promise<{
    success: boolean;
    data: any[];
  }> => {
    return apiService.get(`/quiz-analytics/quiz/${quizId}/teams`);
  },

  // Get User Performance
  getUserPerformance: (quizId: string): Promise<{
    success: boolean;
    data: any[];
  }> => {
    return apiService.get(`/quiz-analytics/quiz/${quizId}/users`);
  },

  // Get Time Analytics
  getTimeAnalytics: (quizId: string): Promise<{
    success: boolean;
    data: any;
  }> => {
    return apiService.get(`/quiz-analytics/quiz/${quizId}/time`);
  },

  // Get Trend Analytics (Default 30 days)
  getTrendAnalytics: (): Promise<{
    success: boolean;
    data: any;
  }> => {
    return apiService.get('/quiz-analytics/trends');
  },

  // Get Trend Analytics for N Days
  getTrendAnalyticsForDays: (days: number): Promise<{
    success: boolean;
    data: any;
  }> => {
    return apiService.get(`/quiz-analytics/trends/${days}`);
  },

  // Get Comparative Analytics
  getComparativeAnalytics: (): Promise<{
    success: boolean;
    data: any[];
  }> => {
    return apiService.get('/quiz-analytics/comparative');
  }
};