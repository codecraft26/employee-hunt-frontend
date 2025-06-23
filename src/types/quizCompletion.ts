// src/types/quizCompletion.ts

export interface QuizCompletionStatus {
  isCompleted: boolean;
  totalAssigned: number;
  completedCount: number;
  remainingCount: number;
  completionPercentage: number;
}

export interface UserQuizWithCompletion {
  quiz: any; // Use UserQuiz if available
  completionStatus: QuizCompletionStatus;
  canAccess: boolean;
  message: string | null;
}
