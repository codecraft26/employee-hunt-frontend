// components/user/UserQuizTab.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Target, 
  Clock, 
  Trophy, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Users,
  Calendar,
  Award,
  Timer,
  ArrowRight,
  X,
  ChevronDown,
  Medal,
  Star,
  BarChart3,
  SkipForward,
  Check,
  XCircle,
  Crown,
  TrendingUp,
  Zap,
  Activity
} from 'lucide-react';
import { useUserQuizzes, UserQuiz, UserQuizQuestion } from '../../hooks/useUserQuizzes';
import QuizNotifications from '../quiz/QuizNotifications';
import TimedQuizComponent from '../quiz/TimedQuizComponent';
import Cookies from 'js-cookie';

// Enhanced feedback data interface for comprehensive analytics
interface EnhancedFeedbackData {
  isCorrect: boolean;
  pointsEarned: number;
  selectedOption: number;
  correctAnswer?: number;
  questionPoints?: number;
  timeTaken?: number;
  timeLimit?: number;
  teamScore?: number;
  teamRank?: number;
  totalTeams?: number;
  accuracy?: number;
  streak?: number;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  showFeedback: boolean;
  questionId?: string;
  quizType?: 'TEAM' | 'INDIVIDUAL';
  teamName?: string;
}

const UserQuizTab: React.FC = () => {
  // Add CSS animation for enhanced feedback and performance indicators
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes progress {
        from { width: 0%; }
        to { width: 100%; }
      }
      @keyframes pulse-red {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes bounceIn {
        0% {
          opacity: 0;
          transform: scale(0.3);
        }
        50% {
          opacity: 1;
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes particleFloat {
        0% {
          opacity: 1;
          transform: translateY(0px) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateY(-100px) scale(0.5);
        }
      }
      .pulse-critical {
        animation: pulse-red 1s ease-in-out infinite;
      }
      .slide-in {
        animation: slideIn 0.3s ease-out forwards;
      }
      .bounce-in {
        animation: bounceIn 0.6s ease-out forwards;
      }
      .fade-in-up {
        animation: fadeInUp 0.5s ease-out forwards;
      }
      .scale-in {
        animation: scaleIn 0.4s ease-out forwards;
      }
      .particle-float {
        animation: particleFloat 2s ease-out forwards;
      }
      .enhanced-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: center;
      }
      .enhanced-card:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }
      .glow-effect {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
      }
      .success-glow {
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
      }
      .error-glow {
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const {
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
    markQuizAsCompleted
  } = useUserQuizzes();

  // Component state
  const [selectedQuiz, setSelectedQuiz] = useState<UserQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showRankingsModal, setShowRankingsModal] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [quizTimeRemaining, setQuizTimeRemaining] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [cardTimerUpdate, setCardTimerUpdate] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuestionReview, setShowQuestionReview] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Timed quiz state
  const [showTimedQuiz, setShowTimedQuiz] = useState(false);
  const [timedQuizData, setTimedQuizData] = useState<UserQuiz | null>(null);
  const [quizSessionStatus, setQuizSessionStatus] = useState<Record<string, any>>({});
  
  // Enhanced answer feedback state with comprehensive analytics
  const [answerFeedback, setAnswerFeedback] = useState<EnhancedFeedbackData | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  
  // Performance tracking and analytics
  const [performanceStreak, setPerformanceStreak] = useState(0);
  const [quizStats, setQuizStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    averageTime: 0,
    bestStreak: 0,
    categories: {} as Record<string, { correct: number; total: number }>,
    difficulty: {} as Record<string, { correct: number; total: number }>
  });
  
  // Animation states for enhanced feedback
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'showing' | 'exiting'>('entering');
  const [showDetails, setShowDetails] = useState(false);
  const [particleAnimation, setParticleAnimation] = useState(false);
  const [achievementNotification, setAchievementNotification] = useState<string | null>(null);

  // Helper function to determine if quiz should use timed system
  const shouldUseTimedSystem = useCallback((quiz: UserQuiz) => {
    return quiz.status === 'ACTIVE';
  }, []);

  // Function to fetch session status for timed quizzes
  const fetchTimedQuizSessionStatus = useCallback(async () => {
    const timedQuizzes = quizzesWithCompletion.filter(item => shouldUseTimedSystem(item.quiz));
    const sessionStatuses: Record<string, any> = {};
    
    for (const item of timedQuizzes) {
      try {
        const token = Cookies.get('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${item.quiz.id}/session-status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData.success) {
            sessionStatuses[item.quiz.id] = sessionData.data;
          }
        }
      } catch (error) {
        console.error(`Failed to fetch session status for quiz ${item.quiz.id}:`, error);
      }
    }
    
    setQuizSessionStatus(sessionStatuses);
  }, [quizzesWithCompletion, shouldUseTimedSystem]);

  // Enhanced feedback animation sequence
  useEffect(() => {
    if (answerFeedback?.showFeedback) {
      setAnimationPhase('entering');
      
      // Show main feedback animation
      const enteringTimer = setTimeout(() => {
        setAnimationPhase('showing');
        
        // Show particles for correct answers
        if (answerFeedback.isCorrect) {
          setParticleAnimation(true);
          
          // Check for achievements
          if (answerFeedback.streak && answerFeedback.streak >= 5) {
            setAchievementNotification(`🔥 ${answerFeedback.streak}-Question Streak!`);
          } else if (answerFeedback.accuracy && answerFeedback.accuracy >= 90) {
            setAchievementNotification('🎯 Expert Performance!');
          }
        }
        
        // Show details after brief delay
        const detailsTimer = setTimeout(() => {
          setShowDetails(true);
        }, 600);
        
        // Start exit animation
        const exitTimer = setTimeout(() => {
          setAnimationPhase('exiting');
          
          // Complete feedback cycle
          const completeTimer = setTimeout(() => {
            handleEnhancedFeedbackComplete();
          }, 500);
          
          return () => clearTimeout(completeTimer);
        }, 3500); // Extended to 3.5 seconds for comprehensive feedback
        
        return () => {
          clearTimeout(detailsTimer);
          clearTimeout(exitTimer);
        };
      }, 300);
      
      return () => clearTimeout(enteringTimer);
    }
  }, [answerFeedback?.showFeedback]);

  // Reset animation state when feedback changes
  useEffect(() => {
    if (!answerFeedback?.showFeedback) {
      setAnimationPhase('entering');
      setShowDetails(false);
      setParticleAnimation(false);
      setAchievementNotification(null);
    }
  }, [answerFeedback?.showFeedback]);

  // Handle enhanced feedback completion
  const handleEnhancedFeedbackComplete = useCallback(() => {
    console.log('⏰ Enhanced feedback complete - Auto-advancing...');
    setAnswerFeedback(null);
    setIsAnswerSubmitted(false);
    
    const isLastQuestion = currentQuestionIndex === assignedQuestions.length - 1;
    if (isLastQuestion) {
      const currentUnanswered = assignedQuestions.filter(q => !q.isCompleted).length;
      if (currentUnanswered === 1) {
        setShowQuizModal(false);
        alert('🎉 Quiz Completed! Your answers have been submitted successfully.');
        fetchMyQuizzes();
      } else {
        handleMoveToNextQuestion();
      }
    } else {
      handleMoveToNextQuestion();
    }
  }, [currentQuestionIndex, assignedQuestions, fetchMyQuizzes]);

  // Update quiz statistics
  const updateQuizStats = useCallback((isCorrect: boolean, timeTaken: number, category?: string, difficulty?: string) => {
    setQuizStats(prev => {
      const newStats = { ...prev };
      newStats.totalQuestions += 1;
      if (isCorrect) {
        newStats.correctAnswers += 1;
      }
      
      // Update average time
      newStats.averageTime = (prev.averageTime * (prev.totalQuestions - 1) + timeTaken) / prev.totalQuestions;
      
      // Update best streak
      if (isCorrect) {
        setPerformanceStreak(prev => {
          const newStreak = prev + 1;
          newStats.bestStreak = Math.max(newStats.bestStreak, newStreak);
          return newStreak;
        });
      } else {
        setPerformanceStreak(0);
      }
      
      // Update category stats
      if (category) {
        if (!newStats.categories[category]) {
          newStats.categories[category] = { correct: 0, total: 0 };
        }
        newStats.categories[category].total += 1;
        if (isCorrect) {
          newStats.categories[category].correct += 1;
        }
      }
      
      // Update difficulty stats
      if (difficulty) {
        if (!newStats.difficulty[difficulty]) {
          newStats.difficulty[difficulty] = { correct: 0, total: 0 };
        }
        newStats.difficulty[difficulty].total += 1;
        if (isCorrect) {
          newStats.difficulty[difficulty].correct += 1;
        }
      }
      
      return newStats;
    });
  }, []);

  // Calculate comprehensive performance metrics
  const getEnhancedPerformanceMetrics = useCallback(() => {
    const accuracy = quizStats.totalQuestions > 0 ? Math.round((quizStats.correctAnswers / quizStats.totalQuestions) * 100) : 0;
    
    const speedRating = quizStats.averageTime <= 15 ? 'Lightning Fast' :
                       quizStats.averageTime <= 25 ? 'Quick' :
                       quizStats.averageTime <= 35 ? 'Steady' : 'Thoughtful';
    
    const performanceLevel = accuracy >= 90 ? 'Expert' :
                           accuracy >= 75 ? 'Proficient' :
                           accuracy >= 60 ? 'Good' :
                           accuracy >= 40 ? 'Improving' : 'Developing';
    
    const consistencyScore = performanceStreak >= 5 ? 'Excellent' :
                           performanceStreak >= 3 ? 'Good' :
                           performanceStreak >= 1 ? 'Fair' : 'Variable';
    
    return {
      accuracy,
      speedRating,
      performanceLevel,
      consistencyScore,
      totalQuestions: quizStats.totalQuestions,
      correctAnswers: quizStats.correctAnswers,
      averageTime: Math.round(quizStats.averageTime),
      bestStreak: quizStats.bestStreak,
      currentStreak: performanceStreak
    };
  }, [quizStats, performanceStreak]);

  // Fetch quizzes on component mount
  useEffect(() => {
    fetchMyQuizzes();
  }, [fetchMyQuizzes]);

  // Fetch session status for timed quizzes when quizzes are loaded
  useEffect(() => {
    if (quizzesWithCompletion.length > 0) {
      fetchTimedQuizSessionStatus();
    }
  }, [quizzesWithCompletion, fetchTimedQuizSessionStatus]);

  // Update quiz cards every minute to refresh timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCardTimerUpdate(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Timer for current question
  useEffect(() => {
    if (showQuizModal && assignedQuestions.length > 0 && timeRemaining > 0 && !getCurrentQuestion()?.isCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showQuizModal, timeRemaining, assignedQuestions, currentQuestionIndex]);

  // Timer for entire quiz duration
  useEffect(() => {
    if (showQuizModal && selectedQuiz) {
      const updateQuizTimer = () => {
        const now = new Date();
        const endTime = new Date(selectedQuiz.endTime);
        const remainingSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
        
        setQuizTimeRemaining(remainingSeconds);
        
        if (remainingSeconds <= 0) {
          alert('Quiz time has expired!');
          handleCloseQuiz();
        }
      };

      updateQuizTimer();
      const timer = setInterval(updateQuizTimer, 1000);

      return () => clearInterval(timer);
    }
  }, [showQuizModal, selectedQuiz]);

  // Helper function to get current question
  const getCurrentQuestion = (): UserQuizQuestion | null => {
    if (!assignedQuestions || currentQuestionIndex >= assignedQuestions.length) {
      return null;
    }
    return assignedQuestions[currentQuestionIndex];
  };

  // Helper function to find next unanswered question
  const findNextUnansweredQuestion = (startIndex: number = 0): number => {
    for (let i = startIndex; i < assignedQuestions.length; i++) {
      if (!assignedQuestions[i].isCompleted) {
        return i;
      }
    }
    return -1;
  };

  // Helper function to get quiz completion status
  const getQuizCompletionStatus = () => {
    const totalQuestions = assignedQuestions.length;
    const completedQuestions = assignedQuestions.filter(q => q.isCompleted).length;
    const isAllCompleted = completedQuestions === totalQuestions;
    
    return {
      total: totalQuestions,
      completed: completedQuestions,
      remaining: totalQuestions - completedQuestions,
      isAllCompleted
    };
  };

  const handleRefresh = useCallback(() => {
    clearError();
    fetchMyQuizzes();
  }, [clearError, fetchMyQuizzes]);

  // Handle timed quiz completion
  const handleTimedQuizComplete = useCallback((score: number) => {
    setShowTimedQuiz(false);
    setTimedQuizData(null);
    alert('🎉 Quiz Completed! Your answers have been submitted successfully.');
    fetchMyQuizzes();
  }, [fetchMyQuizzes]);

  // Handle timed quiz close
  const handleTimedQuizClose = useCallback(() => {
    setShowTimedQuiz(false);
    setTimedQuizData(null);
  }, []);

  const handleStartQuiz = async (quiz: UserQuiz) => {
    // Check if user has already completed this quiz
    const completionStatus = quizzesWithCompletion.find(q => q.quiz.id === quiz.id)?.completionStatus;
    if (completionStatus?.isCompleted) {
      alert('You have already completed this quiz! You cannot retake it.');
      return;
    }

    // Check if quiz should use timed system
    if (shouldUseTimedSystem(quiz)) {
      console.log('Using enhanced timed quiz system for:', quiz.title);
      
      try {
        const token = Cookies.get('token');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quiz.id}/session-status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData.success && sessionData.data.hasStarted) {
            alert('You have already attempted this quiz. You can only attempt it once.');
            return;
          }
        }
      } catch (error) {
        console.error('Failed to check session status:', error);
      }
      
      setTimedQuizData(quiz);
      setShowTimedQuiz(true);
      return;
    }

    // Enhanced traditional quiz system
    try {
      console.log('Starting enhanced traditional quiz:', quiz);
      setSelectedQuiz(quiz);
      setQuizStartTime(new Date());
      
      // Reset performance tracking for new quiz
      setQuizStats({
        totalQuestions: 0,
        correctAnswers: 0,
        averageTime: 0,
        bestStreak: 0,
        categories: {},
        difficulty: {}
      });
      setPerformanceStreak(0);
      
      clearError();
      
      console.log('Fetching quiz details and questions...');
      await getQuizById(quiz.id);
      const questions = await getAssignedQuestions(quiz.id);
      
      if (questions && questions.length > 0) {
        const nextUnansweredIndex = findNextUnansweredQuestion(0);
        const startIndex = nextUnansweredIndex !== -1 ? nextUnansweredIndex : 0;
        
        setCurrentQuestionIndex(startIndex);
        setSelectedAnswer(null);
        setShowQuestionReview(false);
        setAnswerFeedback(null);
        setIsAnswerSubmitted(false);
        
        if (questions[startIndex]?.isCompleted) {
          setShowQuestionReview(true);
          setSelectedAnswer(questions[startIndex].userAnswer || null);
          setTimeRemaining(0);
        } else {
          const timeLimit = questions[startIndex]?.question?.timeLimit || 30;
          setTimeRemaining(typeof timeLimit === 'number' ? timeLimit : parseInt(timeLimit) || 30);
        }
        
        setShowQuizModal(true);
      } else {
        const errorMsg = error || 'No questions available for this quiz. Please contact an administrator.';
        alert(errorMsg);
      }
    } catch (err: any) {
      console.error('Failed to start enhanced quiz:', err);
      const errorMsg = err.message || error || 'Failed to start quiz. Please try again.';
      alert(errorMsg);
    }
  };

  const handleViewResults = async (quiz: UserQuiz) => {
    try {
      setSelectedQuiz(quiz);
      const resultsData = await getQuizResults(quiz.id);
      await getQuizById(quiz.id);
      setShowResultsModal(true);
    } catch (err) {
      console.error('Failed to fetch quiz results:', err);
      setSelectedQuiz(quiz);
      await getQuizById(quiz.id);
      setShowResultsModal(true);
    }
  };

  const handleViewRankings = async (quiz: UserQuiz) => {
    setSelectedQuiz(quiz);
    await getTeamRankings(quiz.id);
    setShowRankingsModal(true);
  };

  const handleSubmitAnswer = async () => {
    setSubmitError(null);
    const currentQuestion = getCurrentQuestion();
    
    if (selectedAnswer === null || 
        !selectedQuiz || 
        !currentQuestion || 
        currentQuestion.isCompleted || 
        isSubmitting ||
        isQuestionAnswered(currentQuestion.question.id) ||
        (currentQuestion.userAnswer !== null && currentQuestion.userAnswer !== undefined)) {
      setSubmitError('You have already answered this question.');
      return;
    }

    setIsSubmitting(true);
    
    const timeTaken = (currentQuestion.question?.timeLimit || 30) - timeRemaining;
    const isLastQuestion = currentQuestionIndex === assignedQuestions.length - 1;
    
    try {
      const success = await submitAnswer(selectedQuiz.id, currentQuestion.question.id, {
        selectedOption: selectedAnswer,
        timeTaken: timeTaken
      });

      if (success) {
        if (isLastQuestion) {
          const currentUnanswered = assignedQuestions.filter(q => !q.isCompleted).length;
          
          if (currentUnanswered === 1) {
            setTimeout(() => {
              setShowQuizModal(false);
              alert('🎉 Quiz Completed! Your answers have been submitted successfully.');
              fetchMyQuizzes();
            }, 200);
          } else {
            setTimeout(() => {
              handleMoveToNextQuestion();
            }, 100);
          }
        } else {
          handleMoveToNextQuestion();
        }
      }
    } catch (err: any) {
      console.error('Enhanced submit error:', err);
      let errorMessage = 'Failed to submit answer.';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveToNextQuestion = () => {
    if (currentQuestionIndex < assignedQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQuestion = assignedQuestions[nextIndex];
      
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setAnswerFeedback(null);
      setIsAnswerSubmitted(false);
      
      if (nextQuestion?.isCompleted) {
        setShowQuestionReview(true);
        setSelectedAnswer(nextQuestion.userAnswer || null);
        setTimeRemaining(0);
      } else {
        setShowQuestionReview(false);
        const timeLimit = nextQuestion?.question?.timeLimit || 30;
        setTimeRemaining(typeof timeLimit === 'number' ? timeLimit : parseInt(timeLimit) || 30);
      }
    } else {
      const nextUnansweredIndex = findNextUnansweredQuestion(0);
      if (nextUnansweredIndex !== -1) {
        setCurrentQuestionIndex(nextUnansweredIndex);
        setSelectedAnswer(null);
        setShowQuestionReview(false);
        setAnswerFeedback(null);
        setIsAnswerSubmitted(false);
        const timeLimit = assignedQuestions[nextUnansweredIndex]?.question?.timeLimit || 30;
        setTimeRemaining(typeof timeLimit === 'number' ? timeLimit : parseInt(timeLimit) || 30);
      } else {
        setShowQuizModal(false);
        alert('🎉 All questions completed! Your answers have been submitted.');
        fetchMyQuizzes();
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      const prevQuestion = assignedQuestions[prevIndex];
      
      setCurrentQuestionIndex(prevIndex);
      setAnswerFeedback(null);
      setIsAnswerSubmitted(false);
      
      if (prevQuestion?.isCompleted) {
        setShowQuestionReview(true);
        setSelectedAnswer(prevQuestion.userAnswer || null);
        setTimeRemaining(0);
      } else {
        setShowQuestionReview(false);
        setSelectedAnswer(null);
        const timeLimit = prevQuestion?.question?.timeLimit || 30;
        setTimeRemaining(typeof timeLimit === 'number' ? timeLimit : parseInt(timeLimit) || 30);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < assignedQuestions.length - 1) {
      handleMoveToNextQuestion();
    }
  };

  const handleAutoSubmit = () => {
    console.log('Auto-submitting due to timeout');
    // Auto-submit with no answer selected (timeout)
    handleSubmitAnswer();
  };

  // Enhanced answer selection with comprehensive feedback
  const handleAnswerSelection = async (optionIndex: number) => {
    if (showQuestionReview || isSubmitting || isAnswerSubmitted) return;
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !selectedQuiz || currentQuestion.isCompleted) return;
    
    setSelectedAnswer(optionIndex);
    setSubmitError(null);
    setIsSubmitting(true);
    setIsAnswerSubmitted(true);
    
    const timeTaken = (currentQuestion.question?.timeLimit || 30) - timeRemaining;
    
    try {
      console.log('🎯 Enhanced Quiz - Submitting answer for option:', optionIndex);
      const response = await submitAnswer(selectedQuiz.id, currentQuestion.question.id, {
        selectedOption: optionIndex,
        timeTaken: timeTaken
      });

      console.log('📥 Enhanced Quiz - Response received:', response);

      if (response && typeof response === 'object' && response.success) {
        // Update performance stats
        updateQuizStats(
          response.isCorrect, 
          timeTaken, 
          'General Knowledge', // This would come from question metadata
          'medium' // This would come from question metadata
        );

        // Get current performance metrics
        const metrics = getEnhancedPerformanceMetrics();
        
        // Create comprehensive enhanced feedback data
        const enhancedFeedbackData: EnhancedFeedbackData = {
          isCorrect: response.isCorrect,
          pointsEarned: response.pointsEarned,
          selectedOption: optionIndex,
          correctAnswer: currentQuestion.question?.correctAnswer,
          questionPoints: currentQuestion.question?.points || 10,
          timeTaken: timeTaken,
          timeLimit: currentQuestion.question?.timeLimit || 30,
          teamScore: undefined, // This would come from team data
          teamRank: undefined, // This would come from rankings
          totalTeams: undefined, // This would come from quiz data
          accuracy: metrics.accuracy,
          streak: metrics.currentStreak,
          explanation: !response.isCorrect ? "Review the correct answer and learn from this question." : undefined,
          difficulty: 'medium',
          category: 'General Knowledge',
          showFeedback: true,
          questionId: currentQuestion.question.id,
          quizType: 'INDIVIDUAL', // This would come from quiz metadata
          teamName: undefined // This would come from user's team data
        };
        
        console.log('🎨 Enhanced Quiz - Setting comprehensive feedback data:', enhancedFeedbackData);
        setAnswerFeedback(enhancedFeedbackData);
      }
    } catch (err: any) {
      console.error('Enhanced Quiz - Submit error:', err);
      let errorMessage = 'Failed to submit answer.';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      setSubmitError(errorMessage);
      setIsAnswerSubmitted(false);
      setSelectedAnswer(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseQuiz = async () => {
    if (selectedQuiz) {
      await closeQuizAccess(selectedQuiz.id);
      markQuizAsCompleted(selectedQuiz.id);
      await fetchMyQuizzes();
    }
    setShowQuizModal(false);
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setTimeRemaining(0);
    setQuizTimeRemaining(0);
    setQuizStartTime(null);
    setShowQuestionReview(false);
    setAnswerFeedback(null);
    setIsAnswerSubmitted(false);
    resetState();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Play className="h-4 w-4" />;
      case 'UPCOMING': return <Clock className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'EXPIRED': return <AlertCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatQuizTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced feedback animation classes
  const getFeedbackAnimationClasses = () => {
    switch (animationPhase) {
      case 'entering':
        return 'opacity-0 scale-75 translate-y-4';
      case 'showing':
        return 'opacity-100 scale-100 translate-y-0';
      case 'exiting':
        return 'opacity-0 scale-95 translate-y-2';
      default:
        return '';
    }
  };

  const getFeedbackColor = () => {
    return answerFeedback?.isCorrect ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600';
  };

  const getStreakMessage = () => {
    const streak = answerFeedback?.streak || 0;
    if (streak < 2) return null;
    if (streak >= 5) return `🔥 Amazing ${streak}-question streak!`;
    if (streak >= 3) return `⚡ ${streak} in a row!`;
    return `✨ ${streak} correct!`;
  };

  // Calculate enhanced performance display
  const getPerformanceDisplay = () => {
    if (!answerFeedback) return null;
    
    const { timeTaken, timeLimit, accuracy } = answerFeedback;
    
    const speedBonus = timeTaken && timeLimit ? 
      timeTaken < timeLimit * 0.5 ? 'Lightning Fast!' : 
      timeTaken < timeLimit * 0.75 ? 'Quick Response!' : 
      'Steady Pace' : null;

    const accuracyStatus = accuracy ? 
      accuracy >= 90 ? 'Expert' :
      accuracy >= 75 ? 'Proficient' :
      accuracy >= 60 ? 'Good' :
      'Improving' : null;

    return { speedBonus, accuracyStatus };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="gaming-card p-4 sm:p-6 animate-pulse">
            <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-1/3"></div>
            <div className="mt-4 h-10 bg-slate-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 gaming-card">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-xl font-bold text-white">Oops! Something went wrong.</h3>
        <p className="mt-2 text-base text-slate-400">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-6 btn-gaming inline-flex items-center"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gradient mb-2 flex items-center">
          <Target className="h-7 w-7 sm:h-8 sm:h-8 mr-3 text-blue-400" />
          My Quizzes
        </h2>
        <p className="text-slate-300 text-sm sm:text-base">
          Real-time feedback, performance analytics, and team collaboration features.
        </p>
      </div>

      {/* Enhanced Quiz Performance Dashboard */}
      {quizStats.totalQuestions > 0 && (
        <div className="gaming-card p-6 mb-8 scale-in">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
            Your Performance Analytics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-900/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{getEnhancedPerformanceMetrics().accuracy}%</div>
              <div className="text-xs text-slate-400">Accuracy</div>
            </div>
            <div className="bg-green-900/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{getEnhancedPerformanceMetrics().bestStreak}</div>
              <div className="text-xs text-slate-400">Best Streak</div>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{getEnhancedPerformanceMetrics().averageTime}s</div>
              <div className="text-xs text-slate-400">Avg. Time</div>
            </div>
            <div className="bg-orange-900/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-orange-400">{getEnhancedPerformanceMetrics().performanceLevel}</div>
              <div className="text-xs text-slate-400">Level</div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Notifications */}
      <QuizNotifications />

      {quizzesWithCompletion.length === 0 ? (
        <div className="text-center py-12 gaming-card">
          <Shield className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-4 text-xl font-bold text-white">No Quizzes Found</h3>
          <p className="mt-2 text-base text-slate-400">
            No quizzes have been assigned to you yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {quizzesWithCompletion.map((item) => {
            const { quiz, completionStatus, canAccess, message } = item;
            const status = getQuizDisplayStatus(quiz);
            const statusColor = getQuizStatusColor(status);
            const progress = completionStatus?.completionPercentage || 0;
            const isCompleted = completionStatus?.isCompleted;
            
            const isTimedQuiz = shouldUseTimedSystem(quiz);
            const sessionStatus = quizSessionStatus[quiz.id];
            const isTimedQuizStarted = isTimedQuiz && sessionStatus?.hasStarted;
            const shouldShowAsCompleted = isCompleted || isTimedQuizStarted;
            const now = new Date();
            const endTime = new Date(quiz.endTime);
            const remainingTimeSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));

            let actualProgress = progress;
            if (isTimedQuiz && sessionStatus && sessionStatus.session) {
              const totalQuestions = sessionStatus.session.totalQuestions || quiz.totalQuestions;
              const questionsAnswered = sessionStatus.session.questionsAnswered || 0;
              if (totalQuestions > 0) {
                actualProgress = (questionsAnswered / totalQuestions) * 100;
              }
            }
            
            let progressBarColor = 'bg-gradient-to-r from-blue-500 to-indigo-500';
            if (shouldShowAsCompleted || actualProgress === 100) {
              progressBarColor = 'bg-gradient-to-r from-green-500 to-emerald-500';
            } else if (actualProgress >= 80) {
              progressBarColor = 'bg-gradient-to-r from-yellow-400 to-yellow-600';
            } else if (actualProgress <= 30) {
              progressBarColor = 'bg-gradient-to-r from-red-500 to-orange-500';
            }

            return (
              <div
                key={quiz.id}
                className={`gaming-card enhanced-card p-4 sm:p-5 flex flex-col justify-between hover-lift group ${
                  shouldShowAsCompleted ? 'opacity-95 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/50 success-glow' : 'glow-effect'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-gradient transition-colors duration-300">
                      {quiz.title}
                    </h3>
                    <div
                      className={`flex items-center text-xs font-bold px-3 py-1 rounded-full ${statusColor}`}
                    >
                      {getStatusIcon(status)}
                      <span className="ml-1.5">{status}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span className="flex items-center space-x-2">
                        <span>
                          {isTimedQuiz && sessionStatus ? (
                            sessionStatus.isCompleted ? (
                              `Quiz Completed (${sessionStatus.session?.questionsAnswered || 0}/${sessionStatus.session?.totalQuestions || quiz.totalQuestions})`
                            ) : sessionStatus.hasStarted ? (
                              `In Progress (${sessionStatus.session?.questionsAnswered || 0}/${sessionStatus.session?.totalQuestions || quiz.totalQuestions})`
                            ) : (
                              `Ready to Start (${quiz.totalQuestions} questions)`
                            )
                          ) : (
                            `${completionStatus?.completedCount || 0} / ${completionStatus?.totalAssigned || 0} completed`
                          )}
                        </span>
                        {shouldShowAsCompleted && <Crown className="h-3 w-3 text-yellow-400" />}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${progressBarColor} h-2 rounded-full transition-all duration-500 ${
                          shouldShowAsCompleted ? 'animate-pulse' : ''
                        }`}
                        style={{ width: `${actualProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Enhanced Timer Display */}
                  {status === 'ACTIVE' && !shouldShowAsCompleted && canAccess && (
                    <div className={`mb-3 p-3 rounded-lg border-2 transition-all duration-300 ${
                      remainingTimeSeconds <= 300 
                        ? 'bg-red-50 border-red-200 text-red-800 error-glow' 
                        : remainingTimeSeconds <= 600 
                        ? 'bg-orange-50 border-orange-200 text-orange-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800 glow-effect'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <Timer className={`h-4 w-4 ${remainingTimeSeconds <= 300 ? 'animate-pulse' : ''}`} />
                        <div>
                          <p className="text-xs font-medium">
                            {remainingTimeSeconds <= 300 ? '🚨 Time Critical!' : 
                             remainingTimeSeconds <= 600 ? '⚠️ Time Warning!' : 
                             '⏰ Time Remaining:'}
                          </p>
                          <p className={`text-sm font-bold ${
                            remainingTimeSeconds <= 300 ? 'pulse-critical' : ''
                          }`}>
                            {formatQuizTime(remainingTimeSeconds)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-3 text-blue-400" />
                      <span>{quiz.questionsPerParticipant} Questions</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-3 text-green-400" />
                      <span>
                        Starts: {formatQuizDate(quiz.startTime)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-3 text-yellow-400" />
                      <span>
                        Ends: {formatQuizDate(quiz.endTime)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {shouldShowAsCompleted ? (
                    <div className="flex flex-col gap-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg text-center font-semibold text-sm success-glow">
                        ✅ Quiz Completed
                      </div>
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-center text-xs">
                        ⚠️ Cannot retake this quiz
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="mt-4 flex flex-col space-y-2">
                        {(() => {
                          const isTimedQuiz = shouldUseTimedSystem(quiz);
                          const isExpired = isQuizExpired(quiz);
                          
                          if (isExpired) {
                            return (
                              <>
                                <button className="w-full btn-gaming opacity-50 cursor-not-allowed" disabled>
                                  Quiz Expired
                                </button>
                                <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-xs text-center">
                                  This quiz has expired and is no longer available
                                </div>
                              </>
                            );
                          }
                          
                          if (isTimedQuiz) {
                            return (
                              <>
                                <button
                                  className="w-full btn-gaming flex items-center justify-center space-x-2 glow-effect hover:scale-105 transition-all duration-300"
                                  onClick={() => handleStartQuiz(quiz)}
                                  disabled={!canAccess || shouldShowAsCompleted}
                                >
                                  <Zap className="h-4 w-4" />
                                  <span>Start Timed Quiz</span>
                                </button>
                                                                  <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-2 text-xs text-center">
                                    ⚡ Real-time feedback • Live analytics • One attempt only
                                  </div>
                              </>
                            );
                          }
                          
                          return (
                            <>
                              <button
                                className="w-full btn-gaming glow-effect hover:scale-105 transition-all duration-300"
                                onClick={() => handleStartQuiz(quiz)}
                                disabled={!canAccess || shouldShowAsCompleted}
                              >
                                Start Quiz
                              </button>
                              {shouldShowAsCompleted && (
                                <p className="text-green-500 text-xs mt-1">You have already completed this quiz. Retake is not allowed.</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      {!canAccess && message && (
                        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-xs mt-1 text-center">
                          {message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enhanced Quiz Modal */}
      {showQuizModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
          {/* Enhanced Feedback Overlay */}
          {answerFeedback?.showFeedback && (
            <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              {/* Particle Animation for Correct Answers */}
              {particleAnimation && answerFeedback.isCorrect && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 bg-yellow-400 rounded-full particle-float"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 1000}ms`,
                        animationDuration: `${2000 + Math.random() * 1000}ms`
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Main Enhanced Feedback Card */}
              <div 
                className={`relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden transform transition-all duration-700 ease-out ${getFeedbackAnimationClasses()}`}
              >
                {/* Header with Enhanced Gradient */}
                <div className={`bg-gradient-to-r ${getFeedbackColor()} p-6 text-white relative overflow-hidden`}>
                  {/* Enhanced Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                    {answerFeedback.isCorrect && (
                      <div className="absolute top-4 right-4 text-6xl opacity-40 animate-bounce">🎉</div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>

                  {/* Main Result with Enhanced Animation */}
                  <div className="relative z-10 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4 transform transition-all duration-500 ${
                      animationPhase === 'showing' ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
                    }`}>
                      {answerFeedback.isCorrect ? (
                        <CheckCircle className="w-8 h-8 text-white animate-pulse" />
                      ) : (
                        <XCircle className="w-8 h-8 text-white" />
                      )}
                    </div>
                    
                    <h2 className={`text-2xl font-bold mb-2 transform transition-all duration-500 ${
                      animationPhase === 'showing' ? 'translate-y-0 scale-105' : 'translate-y-2 scale-100'
                    }`}>
                      {answerFeedback.isCorrect ? '🎉 Excellent!' : '❌ Not Quite!'}
                    </h2>
                    
                    <p className="text-lg opacity-90">
                      {answerFeedback.isCorrect 
                        ? `+${answerFeedback.pointsEarned} points earned!`
                        : answerFeedback.questionPoints 
                        ? `No points earned (${answerFeedback.questionPoints} points available)`
                        : 'Better luck next time!'
                      }
                    </p>

                    {/* Enhanced Streak Message */}
                    {answerFeedback.isCorrect && getStreakMessage() && (
                      <div className="mt-2 text-sm bg-white/20 rounded-full px-4 py-2 inline-block backdrop-blur-sm">
                        {getStreakMessage()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Details Section */}
                <div className="p-6 space-y-4">
                  {showDetails && (
                    <div className="space-y-3 fade-in-up">
                      {/* Enhanced Time Performance */}
                      {answerFeedback.timeTaken && answerFeedback.timeLimit && (
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">Response Time</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">{answerFeedback.timeTaken}s</div>
                            {getPerformanceDisplay()?.speedBonus && (
                              <div className="text-xs text-blue-600 font-medium">{getPerformanceDisplay()?.speedBonus}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Enhanced Individual Performance */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Your Performance</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-900">+{answerFeedback.pointsEarned} points</div>
                          {answerFeedback.accuracy && (
                            <div className="text-xs text-green-600 font-medium">{answerFeedback.accuracy}% accuracy</div>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Overall Performance */}
                      {getPerformanceDisplay()?.accuracyStatus && (
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">Performance Level</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-purple-900">{getPerformanceDisplay()?.accuracyStatus}</div>
                            {answerFeedback.accuracy && (
                              <div className="text-xs text-purple-600 font-medium">{answerFeedback.accuracy}% overall</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Enhanced Question Metadata */}
                      {(answerFeedback.difficulty || answerFeedback.category) && (
                        <div className="flex space-x-2">
                          {answerFeedback.difficulty && (
                            <div className="flex-1 flex items-center justify-between p-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded border border-orange-200">
                              <span className="text-xs font-medium text-orange-800">Difficulty</span>
                              <span className="text-xs text-orange-600 capitalize font-semibold">{answerFeedback.difficulty}</span>
                            </div>
                          )}
                          {answerFeedback.category && (
                            <div className="flex-1 flex items-center justify-between p-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded border border-indigo-200">
                              <span className="text-xs font-medium text-indigo-800">Category</span>
                              <span className="text-xs text-indigo-600 font-semibold">{answerFeedback.category}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Enhanced Learning Point */}
                      {!answerFeedback.isCorrect && answerFeedback.explanation && (
                        <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border-l-4 border-amber-400">
                          <div className="flex items-start space-x-2">
                            <Star className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-amber-800 mb-1">💡 Learning Opportunity</div>
                              <div className="text-xs text-amber-700">{answerFeedback.explanation}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Motivational Message */}
                      <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        {answerFeedback.isCorrect ? (
                          currentQuestionIndex === assignedQuestions.length - 1 ? 
                          "🎯 Outstanding work! Quiz completion incoming!" : 
                          "🚀 Fantastic! Keep this momentum going!"
                        ) : (
                          currentQuestionIndex === assignedQuestions.length - 1 ? 
                          "📚 Every challenge is a step toward mastery!" : 
                          "💪 Stay focused - you're learning and improving!"
                        )}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Progress Indicator */}
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center space-x-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Processing and advancing...</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Achievement Badge */}
              {answerFeedback.isCorrect && answerFeedback.streak && answerFeedback.streak >= 5 && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bounce-in">
                  <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2">
                    <Crown className="w-5 h-5 animate-pulse" />
                    <span className="text-sm font-bold">🏆 Streak Master!</span>
                  </div>
                </div>
              )}

              {/* Additional Achievement Notification */}
              {achievementNotification && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 scale-in">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
                    <span className="text-sm font-medium">{achievementNotification}</span>
                  </div>
                </div>
              )}
            </div>
          )}

                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
             {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold truncate">{selectedQuiz.title}</h3>
                <p className="text-blue-100 text-sm">Question {currentQuestionIndex + 1} of {assignedQuestions.length}</p>
                {showQuestionReview && (
                  <p className="text-xs text-blue-200 mt-1 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Review Mode - Already Answered
                  </p>
                )}
              </div>
              
              {/* Live Timer Display */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                {!showQuestionReview && timeRemaining > 0 && (
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-mono transition-all duration-300 ${
                    timeRemaining <= 10 
                      ? 'bg-red-500 text-white animate-pulse scale-110' 
                      : timeRemaining <= 30 
                      ? 'bg-orange-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}>
                    <Timer className="h-4 w-4" />
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                )}
                
                {quizTimeRemaining > 0 && (
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-mono ${
                    quizTimeRemaining <= 300 
                      ? 'bg-red-500 text-white' 
                      : quizTimeRemaining <= 600 
                      ? 'bg-orange-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}>
                    <Clock className="h-4 w-4" />
                    <span>{formatQuizTime(quizTimeRemaining)}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleCloseQuiz}
                className="ml-4 p-2 text-blue-100 hover:text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

                         {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Enhanced Progress Bar */}
              <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <div className="flex items-center space-x-4 text-xs">
                    <span>{getQuizCompletionStatus().completed} of {getQuizCompletionStatus().total} completed</span>
                    {quizStats.totalQuestions > 0 && (
                      <>
                        <span className="text-green-600">✓ {getEnhancedPerformanceMetrics().accuracy}%</span>
                        <span className="text-blue-600">🔥 {getEnhancedPerformanceMetrics().currentStreak}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                    style={{ width: `${((currentQuestionIndex + 1) / assignedQuestions.length) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>

                             {/* Question Status Indicator */}
              {showQuestionReview && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 success-glow">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900 text-sm sm:text-base">Question Already Answered</p>
                      <p className="text-xs sm:text-sm text-green-700">
                        {assignedQuestions[currentQuestionIndex]?.isCorrect !== undefined && (
                          <span className="flex items-center space-x-1">
                            {assignedQuestions[currentQuestionIndex].isCorrect ? 
                              <>
                                <Star className="h-3 w-3 text-green-600" />
                                <span>✓ Correct Answer</span>
                              </> : 
                              <>
                                <XCircle className="h-3 w-3 text-red-600" />
                                <span>✗ Incorrect Answer</span>
                              </>
                            }
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

                             {/* Question */}
              <div className={`rounded-lg p-4 sm:p-6 border-2 transition-all duration-300 ${
                showQuestionReview 
                  ? 'bg-green-50 border-green-200 success-glow' 
                  : 'bg-gray-50 border-gray-200 glow-effect'
              }`}>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Question {currentQuestionIndex + 1} of {assignedQuestions.length}
                    </span>
                    {showQuestionReview && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Answered</span>
                      </span>
                    )}
                  </div>
                  {!showQuestionReview && (
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <Timer className="h-4 w-4" />
                      <span>Time: {formatTime(timeRemaining)}</span>
                    </div>
                  )}
                </div>
                
                <h4 className="text-lg sm:text-xl font-medium text-gray-900 mb-4 sm:mb-6 leading-relaxed">
                  {assignedQuestions[currentQuestionIndex]?.question?.question || 'Loading question...'}
                </h4>
                
                <div className="space-y-3">
                  {assignedQuestions[currentQuestionIndex]?.question?.options?.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    
                    const currentCorrectAnswer = showQuestionReview ? 
                      Number(assignedQuestions[currentQuestionIndex]?.question?.correctAnswer) : null;
                    const currentUserAnswer = showQuestionReview ? 
                      Number(assignedQuestions[currentQuestionIndex].userAnswer) : null;
                    
                    const isCorrect = showQuestionReview && (currentCorrectAnswer === index);
                    const isUserAnswer = showQuestionReview && (currentUserAnswer === index);
                    
                    const showingFeedback = answerFeedback?.showFeedback && !showQuestionReview;
                    const isFeedbackAnswer = showingFeedback && answerFeedback?.selectedOption === index;
                    const isFeedbackCorrect = showingFeedback && answerFeedback?.isCorrect;
                    
                    let buttonStyle = '';
                    let iconStyle = '';
                    
                    if (showQuestionReview) {
                      if (isCorrect && isUserAnswer) {
                        buttonStyle = 'border-green-500 bg-green-100 text-green-900 shadow-md success-glow';
                        iconStyle = 'border-green-500 bg-green-500 text-white';
                      } else if (isCorrect) {
                        buttonStyle = 'border-green-500 bg-green-50 text-green-800';
                        iconStyle = 'border-green-500 bg-green-500 text-white';
                      } else if (isUserAnswer) {
                        buttonStyle = 'border-red-500 bg-red-100 text-red-900 shadow-md error-glow';
                        iconStyle = 'border-red-500 bg-red-500 text-white';
                      } else {
                        buttonStyle = 'border-gray-200 bg-white text-gray-700';
                        iconStyle = 'border-gray-300 text-gray-500';
                      }
                    } else if (showingFeedback && isFeedbackAnswer) {
                      if (isFeedbackCorrect) {
                        buttonStyle = 'border-green-500 bg-green-100 text-green-900 shadow-lg transform scale-105 success-glow';
                        iconStyle = 'border-green-500 bg-green-500 text-white';
                      } else {
                        buttonStyle = 'border-red-500 bg-red-100 text-red-900 shadow-lg transform scale-105 error-glow';
                        iconStyle = 'border-red-500 bg-red-500 text-white';
                      }
                    } else if (showingFeedback) {
                      buttonStyle = 'border-gray-200 bg-gray-50 text-gray-500 opacity-60';
                      iconStyle = 'border-gray-300 text-gray-400';
                    } else {
                      buttonStyle = isSelected 
                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md glow-effect transform scale-102' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-25 hover:shadow-sm enhanced-card';
                      iconStyle = isSelected 
                        ? 'border-blue-500 bg-blue-500 text-white' 
                        : 'border-gray-300 text-gray-500';
                    }

                    const isDisabled = showQuestionReview || isSubmitting || isAnswerSubmitted;

                    return (
                      <button
                        key={index}
                        onClick={() => !isDisabled && handleAnswerSelection(index)}
                        disabled={isDisabled}
                        className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 ${buttonStyle} ${
                          isDisabled ? 'cursor-default' : 'cursor-pointer hover:shadow-sm'
                        } ${isSubmitting ? 'opacity-75' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-300 ${iconStyle}`}>
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className="text-sm sm:text-base leading-relaxed">{option}</span>
                          </div>
                          {showQuestionReview && (
                            <div className="flex items-center space-x-1">
                              {isCorrect && <Check className="h-4 w-4 text-green-600" />}
                              {isUserAnswer && !isCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                            </div>
                          )}
                          {showingFeedback && isFeedbackAnswer && (
                            <div className="flex items-center space-x-1">
                              {isFeedbackCorrect ? (
                                <Check className="h-5 w-5 text-green-600 animate-pulse" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600 animate-pulse" />
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  }) || []}
                </div>
              </div>

                             {/* Question Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <div className="text-center">
                  <span className="font-medium block flex items-center justify-center space-x-1">
                    <Trophy className="h-3 w-3 text-blue-600" />
                    <span>Points</span>
                  </span>
                  <span className="text-blue-600 font-semibold">{String(assignedQuestions[currentQuestionIndex]?.question?.points || 0)}</span>
                </div>
                <div className="text-center">
                  <span className="font-medium block flex items-center justify-center space-x-1">
                    <Timer className="h-3 w-3 text-green-600" />
                    <span>Time Limit</span>
                  </span>
                  <span className="text-green-600 font-semibold">{String(assignedQuestions[currentQuestionIndex]?.question?.timeLimit || 0)}s</span>
                </div>
                <div className="text-center">
                  <span className="font-medium block flex items-center justify-center space-x-1">
                    <Activity className="h-3 w-3 text-purple-600" />
                    <span>Difficulty</span>
                  </span>
                  <span className="text-purple-600 font-semibold">Medium</span>
                </div>
                <div className="text-center">
                  <span className="font-medium block flex items-center justify-center space-x-1">
                    <Star className="h-3 w-3 text-orange-600" />
                    <span>Category</span>
                  </span>
                  <span className="text-orange-600 font-semibold text-xs">General</span>
                </div>
              </div>

              {submitError && (
                <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-3 flex items-center gap-2 error-glow">
                  <XCircle className="h-5 w-5" />
                  <span>{submitError}</span>
                </div>
              )}
              
                             {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 enhanced-card"
                  >
                    Previous
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={async () => {
                      if (!showQuestionReview) {
                        await handleSubmitAnswer();
                      } else {
                        handleMoveToNextQuestion();
                      }
                    }}
                    disabled={(!showQuestionReview && selectedAnswer === null) || isSubmitting}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-300 glow-effect enhanced-card"
                  >
                    {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                    <span>
                      {(() => {
                        const completion = getQuizCompletionStatus();
                        if (completion.remaining === 1 && !showQuestionReview) {
                          return 'Finish Quiz';
                        } else if (currentQuestionIndex === assignedQuestions.length - 1) {
                          return 'Finish';
                        } else {
                          return 'Next';
                        }
                      })()}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Timed Quiz Component */}
      {showTimedQuiz && timedQuizData && (
        <TimedQuizComponent
          quiz={timedQuizData}
          onClose={handleTimedQuizClose}
          onComplete={handleTimedQuizComplete}
        />
      )}
    </div>
  );
};

export default UserQuizTab;