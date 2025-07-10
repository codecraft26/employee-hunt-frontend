// Quiz Types based on the implementation guide

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  questionOrderMode: 'SEQUENTIAL' | 'RANDOM';
  startTime: Date;
  endTime: Date;
  resultDisplayTime?: Date;
  isResultPublished: boolean;
  totalTeams: number;
  totalParticipants: number;
  totalQuestions: number;
  questionsPerParticipant: number;
  winningTeam?: Team;
  createdBy: User;
  questions: QuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  timeLimit: number; // in seconds
  quiz: Quiz;
  answers: QuizAnswer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAnswer {
  id: string;
  selectedOption: number;
  isCorrect: boolean;
  pointsEarned: number;
  timeTaken: number; // in seconds
  quiz: Quiz;
  team: Team;
  question: QuizQuestion;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAssignment {
  id: string;
  quiz: Quiz;
  question: QuizQuestion;
  assignedTo: User;
  team: Team;
  isCompleted: boolean;
  score: number;
  timeTaken: number;
  answer?: number;
  isCorrect: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Request/Response Types

export interface CreateQuizRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  resultDisplayTime?: string;
  questionOrderMode: 'SEQUENTIAL' | 'RANDOM';
  questionsPerParticipant: number;
  questions: CreateQuestionRequest[];
}

export interface CreateQuestionRequest {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  timeLimit: number;
}

export interface UpdateQuizRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  resultDisplayTime?: string;
}

export interface UpdateQuestionRequest {
  question?: string;
  options?: string[];
  correctAnswer?: number;
  points?: number;
  timeLimit?: number;
}

export interface SubmitAnswerRequest {
  selectedOption: number;
  timeTaken: number;
}

export interface QuizResponse {
  success: boolean;
  message?: string;
  data: Quiz;
}

export interface QuizzesResponse {
  success: boolean;
  data: Quiz[];
}

export interface QuizAssignmentResponse {
  success: boolean;
  data: QuizAssignment[];
}

export interface QuizAnswerResponse {
  success: boolean;
  message?: string;
  data: QuizAnswer;
}

export interface TeamRanking {
  rank: number;
  team: Team;
  totalScore: number;
  totalParticipants: number;
  averageScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
}

export interface RankingsResponse {
  success: boolean;
  data: TeamRanking[];
}

export interface PublishResultsResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    isResultPublished: boolean;
    rankings: TeamRanking[];
  };
}

export interface DeclareWinnerResponse {
  success: boolean;
  data: {
    quiz: Quiz;
    rankings: TeamRanking[];
  };
}

export interface DeclareWinnerRequest {
  teamId: string;
}

// Quiz Status Types
export type QuizStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED';

// Question Order Mode Types
export type QuestionOrderMode = 'SEQUENTIAL' | 'RANDOM';

// Quiz Statistics
export interface QuizStats {
  totalQuizzes: number;
  activeQuizzes: number;
  completedQuizzes: number;
  upcomingQuizzes: number;
  totalParticipants: number;
  averageScore: number;
}

// User Quiz Progress
export interface UserQuizProgress {
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  totalScore: number;
  teamRank?: number;
  isCompleted: boolean;
}

// Timed Quiz Session Types
export interface TimedQuizSession {
  id: string;
  quiz: Quiz;
  user: User;
  team: Team;
  startedAt: string;
  completedAt?: string;
  totalScore: number;
  questionsAnswered: number;
  questionsTimedOut: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  isCompleted: boolean;
  answers: TimedQuizAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface TimedQuizAnswer {
  id: string;
  session: TimedQuizSession;
  question: QuizQuestion;
  selectedOption?: number;
  isCorrect: boolean;
  pointsEarned: number;
  timeTaken: number;
  timedOut: boolean;
  answeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimedQuizSessionStatus {
  hasStarted: boolean;
  isCompleted: boolean;
  canStart: boolean;
  message: string;
  session?: TimedQuizSession;
}

export interface TimedQuizCurrentQuestion {
  question?: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number;
  isCompleted: boolean;
}

export interface StartTimedQuizResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    quiz: Quiz;
    currentQuestion: QuizQuestion;
    questionNumber: number;
    totalQuestions: number;
    timeLimit: number;
    startedAt: string;
  };
}

export interface SubmitTimedAnswerRequest {
  selectedOption?: number;
}

export interface SubmitTimedAnswerResponse {
  success: boolean;
  message: string;
  data: {
    isCorrect: boolean;
    pointsEarned: number;
    nextQuestion?: QuizQuestion;
    questionNumber: number;
    totalQuestions: number;
    isQuizCompleted: boolean;
  };
}

export interface TimedQuizSessionStatusResponse {
  success: boolean;
  data: TimedQuizSessionStatus;
}

export interface TimedQuizCurrentQuestionResponse {
  success: boolean;
  data: TimedQuizCurrentQuestion;
} 