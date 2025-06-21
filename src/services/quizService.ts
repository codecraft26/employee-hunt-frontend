// import { apiService } from './apiService';
// import {
//   Quiz,
//   CreateQuizRequest,
//   UpdateQuizRequest,
//   UpdateQuestionRequest,
//   SubmitAnswerRequest,
//   QuizResponse,
//   QuizzesResponse,
//   QuizAssignmentResponse,
//   QuizAnswerResponse,
//   RankingsResponse,
//   PublishResultsResponse,
//   DeclareWinnerResponse
// } from '../types/quiz';

// export const quizService = {
//   // 1. Create Quiz (Admin Only)
//   createQuiz: (quizData: CreateQuizRequest): Promise<QuizResponse> => {
//     return apiService.post('/quizzes', quizData);
//   },

//   // 2. Get All Quizzes (Admin Only)
//   getAllQuizzes: (): Promise<QuizzesResponse> => {
//     return apiService.get('/quizzes');
//   },

//   // 3. Get Quiz by ID
//   getQuizById: (quizId: string): Promise<QuizResponse> => {
//     return apiService.get(`/quizzes/${quizId}`);
//   },

//   // 4. Get My Quizzes (User)
//   getMyQuizzes: (): Promise<QuizzesResponse> => {
//     return apiService.get('/quizzes/my-quizzes');
//   },

//   // 5. Get Assigned Questions
//   getAssignedQuestions: (quizId: string): Promise<QuizAssignmentResponse> => {
//     return apiService.get(`/quizzes/${quizId}/assigned-questions`);
//   },

//   // 6. Submit Answer
//   submitAnswer: (quizId: string, questionId: string, answerData: SubmitAnswerRequest): Promise<QuizAnswerResponse> => {
//     return apiService.post(`/quizzes/${quizId}/questions/${questionId}/answer`, answerData);
//   },

//   // 7. Get Team Rankings
//   getTeamRankings: (quizId: string): Promise<RankingsResponse> => {
//     return apiService.get(`/quizzes/${quizId}/rankings`);
//   },

//   // 8. Update Quiz (Admin Only)
//   updateQuiz: (quizId: string, quizData: UpdateQuizRequest): Promise<QuizResponse> => {
//     return apiService.put(`/quizzes/${quizId}`, quizData);
//   },

//   // 9. Update Question (Admin Only)
//   updateQuestion: (quizId: string, questionId: string, questionData: UpdateQuestionRequest): Promise<QuizResponse> => {
//     return apiService.put(`/quizzes/${quizId}/questions/${questionId}`, questionData);
//   },

//   // 10. Publish Results (Admin Only)
//   publishResults: (quizId: string): Promise<PublishResultsResponse> => {
//     return apiService.post(`/quizzes/${quizId}/publish-results`);
//   },

//   // 11. Declare Winner (Admin Only)
//   declareWinner: (quizId: string): Promise<DeclareWinnerResponse> => {
//     return apiService.post(`/quizzes/${quizId}/declare-winner`);
//   },

//   // 12. Delete Quiz (Admin Only)
//   deleteQuiz: (quizId: string): Promise<{ success: boolean; message: string }> => {
//     return apiService.delete(`/quizzes/${quizId}`);
//   },

//   // Additional helper methods

//   // Get Quiz Statistics
//   getQuizStats: (): Promise<{ success: boolean; data: any }> => {
//     return apiService.get('/quizzes/stats');
//   },

//   // Get Active Quizzes
//   getActiveQuizzes: (): Promise<QuizzesResponse> => {
//     return apiService.get('/quizzes/active');
//   },

//   // Get Upcoming Quizzes
//   getUpcomingQuizzes: (): Promise<QuizzesResponse> => {
//     return apiService.get('/quizzes/upcoming');
//   },

//   // Get Completed Quizzes
//   getCompletedQuizzes: (): Promise<QuizzesResponse> => {
//     return apiService.get('/quizzes/completed');
//   },

//   // Get Quiz Results (if published)
//   getQuizResults: (quizId: string): Promise<RankingsResponse> => {
//     return apiService.get(`/quizzes/${quizId}/results`);
//   },

//   // Get User's Quiz Progress
//   getUserQuizProgress: (quizId: string): Promise<{ success: boolean; data: any }> => {
//     return apiService.get(`/quizzes/${quizId}/progress`);
//   },

//   // Get Quiz Analytics (Admin Only)
//   getQuizAnalytics: (quizId: string): Promise<{ success: boolean; data: any }> => {
//     return apiService.get(`/quizzes/${quizId}/analytics`);
//   }
// };

// export default quizService; 