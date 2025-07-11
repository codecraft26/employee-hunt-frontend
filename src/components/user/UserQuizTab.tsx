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
  XCircle
} from 'lucide-react';
import { useUserQuizzes, UserQuiz, UserQuizQuestion } from '../../hooks/useUserQuizzes';
import QuizNotifications from '../quiz/QuizNotifications';
import TimedQuizComponent from '../quiz/TimedQuizComponent';
import Cookies from 'js-cookie';

const UserQuizTab: React.FC = () => {
  // Add CSS animation for progress bar and pulse effect
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
      .pulse-critical {
        animation: pulse-red 1s ease-in-out infinite;
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
  // Removed showImmediateFeedback and feedbackData - no longer showing immediate feedback
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());
  // Error message for answer submission
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Timed quiz state
  const [showTimedQuiz, setShowTimedQuiz] = useState(false);
  const [timedQuizData, setTimedQuizData] = useState<UserQuiz | null>(null);
  // Session status for timed quizzes
  const [quizSessionStatus, setQuizSessionStatus] = useState<Record<string, any>>({});

  // Helper function to determine if quiz should use timed system
  // For now, we'll use timed system for all active quizzes
  // In the future, this could be based on quiz configuration
  const shouldUseTimedSystem = useCallback((quiz: UserQuiz) => {
    // Use timed system for active quizzes (this can be modified based on quiz properties)
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

  // No need to check completion status manually; handled by API

  // Update quiz cards every minute to refresh timers
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update card timers without API call
      setCardTimerUpdate(prev => prev + 1);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Timer for current question - RE-ENABLED
  useEffect(() => {
    if (showQuizModal && assignedQuestions.length > 0 && timeRemaining > 0 && !getCurrentQuestion()?.isCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showQuizModal, timeRemaining, assignedQuestions, currentQuestionIndex]);

  // Timer for entire quiz duration - RE-ENABLED
  useEffect(() => {
    if (showQuizModal && selectedQuiz) {
      const updateQuizTimer = () => {
        const now = new Date();
        const endTime = new Date(selectedQuiz.endTime);
        const remainingSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
        
        setQuizTimeRemaining(remainingSeconds);
        
        // Auto-close quiz when time runs out
        if (remainingSeconds <= 0) {
          alert('Quiz time has expired!');
          handleCloseQuiz();
        }
      };

      // Update immediately
      updateQuizTimer();
      
      // Update every second
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
    return -1; // No unanswered questions found
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
    fetchMyQuizzes(); // Refresh quiz list
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
      console.log('Using timed quiz system for:', quiz.title);
      
      // For timed quizzes, check session status first to prevent opening modal for started quizzes
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
        // Continue to show modal if session check fails
      }
      
      setTimedQuizData(quiz);
      setShowTimedQuiz(true);
      return;
    }

    // Traditional quiz system (fallback)
    try {
      console.log('Starting traditional quiz:', quiz); // Debug log
      console.log('Quiz order mode:', quiz.questionOrderMode); // Debug log
      setSelectedQuiz(quiz);
      setQuizStartTime(new Date());
      
      // Clear any previous errors
      clearError();
      
      // Fetch the full quiz details and assigned questions
      console.log('Fetching quiz details...'); // Debug log
      await getQuizById(quiz.id);
      console.log('Fetching assigned questions...'); // Debug log
      const questions = await getAssignedQuestions(quiz.id);
      
      console.log('Fetched questions:', questions); // Debug log
      console.log('Question order:', questions?.map((q: UserQuizQuestion) => ({ id: q.question.id, question: q.question.question.substring(0, 50) + '...' }))); // Debug log
      
      if (questions && questions.length > 0) {
        console.log('First question:', questions[0]); // Debug log
        
        // Find the first unanswered question or start from beginning for review
        const nextUnansweredIndex = findNextUnansweredQuestion(0);
        const startIndex = nextUnansweredIndex !== -1 ? nextUnansweredIndex : 0;
        
        setCurrentQuestionIndex(startIndex);
        setSelectedAnswer(null);
        setShowQuestionReview(false);
        
        // If starting with a completed question, show it in review mode
        if (questions[startIndex]?.isCompleted) {
          setShowQuestionReview(true);
          setSelectedAnswer(questions[startIndex].userAnswer || null);
          setTimeRemaining(0); // No timer for completed questions
        } else {
          // Set timer for unanswered question
          const timeLimit = questions[startIndex]?.question?.timeLimit || 30;
          setTimeRemaining(typeof timeLimit === 'number' ? timeLimit : parseInt(timeLimit) || 30);
        }
        
        console.log('Opening quiz modal...'); // Debug log
        setShowQuizModal(true);
      } else {
        console.error('No questions received or empty questions array');
        const errorMsg = error || 'No questions available for this quiz. This could mean:\n\n• You are not assigned to a team\n• No questions have been assigned to your team\n• The quiz is not properly configured\n\nPlease contact an administrator for assistance.';
        alert(errorMsg);
      }
    } catch (err: any) {
      console.error('Failed to start quiz:', err);
      const errorMsg = err.message || error || 'Failed to start quiz. Please check your internet connection and try again.';
      alert(errorMsg);
    }
  };

  const handleViewResults = async (quiz: UserQuiz) => {
    try {
      setSelectedQuiz(quiz);
      // Use the new quiz results endpoint for comprehensive results
      const resultsData = await getQuizResults(quiz.id);
      // Also get basic quiz data
      await getQuizById(quiz.id);
      setShowResultsModal(true);
    } catch (err) {
      console.error('Failed to fetch quiz results:', err);
      // Fallback to basic quiz data if results endpoint fails
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
    
    // Enhanced validation to prevent duplicate submissions
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
    
    console.log('Submitting answer with data:', {
      quizId: selectedQuiz.id,
      questionId: currentQuestion.question.id,
      selectedAnswer,
      timeTaken,
      currentQuestion,
      isLastQuestion
    }); // Debug log
    
    try {
      const success = await submitAnswer(selectedQuiz.id, currentQuestion.question.id, {
        selectedOption: selectedAnswer,
        timeTaken: timeTaken
      });

      if (success) {
        console.log('Answer submitted successfully. Is last question:', isLastQuestion); // Debug log
        
        if (isLastQuestion) {
          // For the last question, add a small delay to ensure state update completes
          console.log('Last question submitted, checking completion after state update...'); // Debug log
          
          // Also manually check if this was the last unanswered question
          const currentUnanswered = assignedQuestions.filter(q => !q.isCompleted).length;
          console.log('Before submission - unanswered questions remaining:', currentUnanswered); // Debug log
          
          if (currentUnanswered === 1) {
            // This was the last question, force completion
            console.log('🎯 This was the last unanswered question - forcing quiz completion!'); // Debug log
            setTimeout(() => {
              setShowQuizModal(false);
              alert('🎉 Quiz Completed! Your answers have been submitted successfully.');
              fetchMyQuizzes();
            }, 200); // Slightly longer delay for state propagation
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
      console.error('Failed to submit answer:', err);
      // Try to extract error message from various possible locations
      let errorMessage = 'Failed to submit answer.';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveToNextQuestion = () => {
    setSubmitError(null); // Clear error on navigation
    const completionStatus = getQuizCompletionStatus();
    console.log('=== MOVE TO NEXT QUESTION DEBUG ==='); // Debug log
    console.log('Current index:', currentQuestionIndex); // Debug log
    console.log('Total questions:', assignedQuestions.length); // Debug log
    console.log('Completion status:', completionStatus); // Debug log
    console.log('All questions completed status:', assignedQuestions.map((q, idx) => ({ 
      index: idx, 
      id: q.question.id, 
      isCompleted: q.isCompleted,
      userAnswer: q.userAnswer 
    }))); // Debug log
    
    // Check if all questions are now completed
    if (completionStatus.isAllCompleted) {
      console.log('🎉 All questions completed! Closing quiz...'); // Debug log
      setShowQuizModal(false);
      alert('🎉 Quiz Completed! Your answers have been submitted successfully.');
      fetchMyQuizzes();
      return;
    }
    
    // Find next unanswered question
    const nextUnansweredIndex = findNextUnansweredQuestion(currentQuestionIndex + 1);
    console.log('Next unanswered question index:', nextUnansweredIndex); // Debug log
    
    if (nextUnansweredIndex !== -1) {
      setCurrentQuestionIndex(nextUnansweredIndex);
      setSelectedAnswer(null);
      setShowQuestionReview(false);
      const nextQuestion = assignedQuestions[nextUnansweredIndex];
      console.log('Moving to unanswered question:', nextQuestion?.question?.id, nextQuestion?.question?.question?.substring(0, 50) + '...'); // Debug log
      const timeLimit = nextQuestion?.question?.timeLimit || 30;
      setTimeRemaining(typeof timeLimit === 'number' ? timeLimit : parseInt(timeLimit) || 30);
    } else {
      if (currentQuestionIndex < assignedQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        const nextQuestion = assignedQuestions[currentQuestionIndex + 1];
        console.log('Moving to completed question:', nextQuestion?.question?.id); // Debug log
        setSelectedAnswer(nextQuestion?.userAnswer || null);
        setShowQuestionReview(true);
        setTimeRemaining(0);
      } else {
        console.log('Reached end of questions, finishing quiz...'); // Debug log
        setShowQuizModal(false);
        setShowResultsModal(true);
        fetchMyQuizzes();
      }
    }
    console.log('=== END MOVE TO NEXT DEBUG ==='); // Debug log
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setSubmitError(null); // Clear error on navigation
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      const prevQuestion = assignedQuestions[prevIndex];
      if (prevQuestion.isCompleted) {
        setSelectedAnswer(prevQuestion.userAnswer || null);
        setShowQuestionReview(true);
        setTimeRemaining(0);
      } else {
        setSelectedAnswer(null);
        setShowQuestionReview(false);
        const timeLimit = prevQuestion?.question?.timeLimit || 30;
        setTimeRemaining(typeof timeLimit === 'number' ? timeLimit : parseInt(timeLimit) || 30);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < assignedQuestions.length - 1) {
      setSubmitError(null); // Clear error on navigation
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = assignedQuestions[nextIndex];
      if (nextQuestion.isCompleted) {
        setSelectedAnswer(nextQuestion.userAnswer || null);
        setShowQuestionReview(true);
        setTimeRemaining(0);
      } else {
        setSelectedAnswer(null);
        setShowQuestionReview(false);
        const timeLimit = nextQuestion?.question?.timeLimit || 30;
        setTimeRemaining(typeof timeLimit === 'number' ? timeLimit : parseInt(timeLimit) || 30);
      }
    }
  };

  const handleAutoSubmit = () => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion && !currentQuestion.isCompleted) {
      // Submit with no answer selected (or current selection)
      handleSubmitAnswer();
    }
  };

  const handleAnswerSelection = (optionIndex: number) => {
    if (showQuestionReview || isSubmitting) return;
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !selectedQuiz || currentQuestion.isCompleted) return;
    setSelectedAnswer(optionIndex);
    setSubmitError(null); // Clear error on new selection
  };

  const handleCloseQuiz = async () => {
    if (selectedQuiz) {
      await closeQuizAccess(selectedQuiz.id);
      
      // Immediately mark this quiz as completed in local state
      markQuizAsCompleted(selectedQuiz.id);
      
      // Refresh quiz list to get updated data from backend
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
          Your quiz activities - available, completed, and upcoming quizzes.
        </p>
      </div>

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
            
            // For timed quizzes, check if user has started (treat as completed for one-time attempt)
            const isTimedQuiz = shouldUseTimedSystem(quiz);
            const sessionStatus = quizSessionStatus[quiz.id];
            const isTimedQuizStarted = isTimedQuiz && sessionStatus?.hasStarted;
            const shouldShowAsCompleted = isCompleted || isTimedQuizStarted;
            const now = new Date();
            const endTime = new Date(quiz.endTime);
            const remainingTimeSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));

            // Progress bar color
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
                className={`gaming-card p-4 sm:p-5 flex flex-col justify-between hover-lift group ${
                  shouldShowAsCompleted ? 'opacity-95 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/50' : ''
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
                      <span>
                        {isTimedQuiz && sessionStatus ? (
                          // For timed quizzes, show session-based progress
                          sessionStatus.isCompleted ? (
                            `Quiz Completed (${sessionStatus.session?.questionsAnswered || 0}/${sessionStatus.session?.totalQuestions || quiz.totalQuestions})`
                          ) : sessionStatus.hasStarted ? (
                            `In Progress (${sessionStatus.session?.questionsAnswered || 0}/${sessionStatus.session?.totalQuestions || quiz.totalQuestions})`
                          ) : (
                            `Ready to Start (${quiz.totalQuestions} questions)`
                          )
                        ) : (
                          // For traditional quizzes, show normal completion status
                          `${completionStatus?.completedCount || 0} / ${completionStatus?.totalAssigned || 0} completed`
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${progressBarColor} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${actualProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quiz Timer Display */}
                  {status === 'ACTIVE' && !shouldShowAsCompleted && canAccess && (
                    <div className={`mb-3 p-3 rounded-lg border-2 ${
                      remainingTimeSeconds <= 300 
                        ? 'bg-red-50 border-red-200 text-red-800' 
                        : remainingTimeSeconds <= 600 
                        ? 'bg-orange-50 border-orange-200 text-orange-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <Timer className="h-4 w-4" />
                        <div>
                          <p className="text-xs font-medium">
                            {remainingTimeSeconds <= 300 ? 'Time Critical!' : 
                             remainingTimeSeconds <= 600 ? 'Time Warning!' : 
                             'Time Remaining:'}
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
                      <Calendar className="w-4 h-4 mr-3 text-yellow-400" />
                      <span>
                        Ends: {formatQuizDate(quiz.endTime)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {shouldShowAsCompleted ? (
                    <div className="flex flex-col gap-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg text-center font-semibold text-sm">
                        ✅ Quiz Completed
                      </div>
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-center text-xs">
                        ⚠️ Cannot retake this quiz
                      </div>
                      {/* Score display removed for completed quizzes */}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {/* Start/Resume/Review Button */}
                      <div className="mt-4 flex flex-col space-y-2">
                        {(() => {
                          const isTimedQuiz = shouldUseTimedSystem(quiz);
                          const isExpired = isQuizExpired(quiz);
                          
                          // Show different button text and state for timed vs traditional quizzes
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
                                  className="w-full btn-gaming flex items-center justify-center space-x-2"
                                  onClick={() => handleStartQuiz(quiz)}
                                  disabled={!canAccess || shouldShowAsCompleted}
                                >
                                  <Timer className="h-4 w-4" />
                                  <span>Start Timed Quiz</span>
                                </button>
                                <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-2 text-xs text-center">
                                  ⏱️ 30 seconds per question • One attempt only
                                </div>
                              </>
                            );
                          }
                          
                          // Traditional quiz
                          return (
                            <>
                              <button
                                className="w-full btn-gaming"
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

      {/* Quiz Modal */}
      {showQuizModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold truncate">{selectedQuiz.title}</h3>
                <p className="text-blue-100 text-sm">Question {currentQuestionIndex + 1} of {assignedQuestions.length}</p>
                {showQuestionReview && (
                  <p className="text-xs text-blue-200 mt-1">Review Mode - Already Answered</p>
                )}
              </div>
              
              {/* Live Timer Display */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                {/* Question Timer */}
                {!showQuestionReview && timeRemaining > 0 && (
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-mono ${
                    timeRemaining <= 10 
                      ? 'bg-red-500 text-white' 
                      : timeRemaining <= 30 
                      ? 'bg-orange-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}>
                    <Timer className="h-4 w-4" />
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                )}
                
                {/* Quiz Timer */}
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
              {/* Progress Bar */}
              <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{getQuizCompletionStatus().completed} of {getQuizCompletionStatus().total} completed</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / assignedQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Status Indicator */}
              {showQuestionReview && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900 text-sm sm:text-base">Question Already Answered</p>
                      <p className="text-xs sm:text-sm text-green-700">
                        {assignedQuestions[currentQuestionIndex]?.isCorrect !== undefined && (
                          <span>
                            {assignedQuestions[currentQuestionIndex].isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Question */}
              <div className={`rounded-lg p-4 sm:p-6 border-2 transition-colors ${
                showQuestionReview 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                {/* Question Number and Status */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Question {currentQuestionIndex + 1} of {assignedQuestions.length}
                    </span>
                    {showQuestionReview && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        ✓ Answered
                      </span>
                    )}
                  </div>
                  {!showQuestionReview && (
                    <div className="text-sm text-gray-500">
                      Time: {formatTime(timeRemaining)}
                    </div>
                  )}
                </div>
                
                <h4 className="text-lg sm:text-xl font-medium text-gray-900 mb-4 sm:mb-6 leading-relaxed">
                  {assignedQuestions[currentQuestionIndex]?.question?.question || 'Loading question...'}
                </h4>
                
                <div className="space-y-3">
                  {assignedQuestions[currentQuestionIndex]?.question?.options?.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    
                    // For review mode, show correct/incorrect styling
                    const currentCorrectAnswer = showQuestionReview ? 
                      Number(assignedQuestions[currentQuestionIndex]?.question?.correctAnswer) : null;
                    const currentUserAnswer = showQuestionReview ? 
                      Number(assignedQuestions[currentQuestionIndex].userAnswer) : null;
                    
                    const isCorrect = showQuestionReview && (currentCorrectAnswer === index);
                    const isUserAnswer = showQuestionReview && (currentUserAnswer === index);
                    
                    let buttonStyle = '';
                    let iconStyle = '';
                    
                    if (showQuestionReview) {
                      // Review mode styling
                      if (isCorrect && isUserAnswer) {
                        buttonStyle = 'border-green-500 bg-green-100 text-green-900 shadow-sm'; // Correct answer user selected
                        iconStyle = 'border-green-500 bg-green-500 text-white';
                      } else if (isCorrect) {
                        buttonStyle = 'border-green-500 bg-green-50 text-green-800'; // Correct answer
                        iconStyle = 'border-green-500 bg-green-500 text-white';
                      } else if (isUserAnswer) {
                        buttonStyle = 'border-red-500 bg-red-100 text-red-900 shadow-sm'; // Wrong answer user selected
                        iconStyle = 'border-red-500 bg-red-500 text-white';
                      } else {
                        buttonStyle = 'border-gray-200 bg-white text-gray-700'; // Other options
                        iconStyle = 'border-gray-300 text-gray-500';
                      }
                    } else {
                      // Normal mode styling
                      buttonStyle = isSelected 
                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-25';
                      iconStyle = isSelected 
                        ? 'border-blue-500 bg-blue-500 text-white' 
                        : 'border-gray-300 text-gray-500';
                    }

                    const isDisabled = showQuestionReview || isSubmitting;

                    return (
                      <button
                        key={index}
                        onClick={() => !isDisabled && handleAnswerSelection(index)}
                        disabled={isDisabled}
                        className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${buttonStyle} ${
                          isDisabled ? 'cursor-default' : 'cursor-pointer hover:shadow-sm'
                        } ${isSubmitting ? 'opacity-75' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${iconStyle}`}>
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
                        </div>
                      </button>
                    );
                  }) || []}
                </div>
              </div>

              {/* Question Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="text-center">
                  <span className="font-medium block">Points:</span>
                  <span className="text-blue-600 font-semibold">{String(assignedQuestions[currentQuestionIndex]?.question?.points || 0)}</span>
                </div>
                <div className="text-center">
                  <span className="font-medium block">Time Limit:</span>
                  <span className="text-green-600 font-semibold">{String(assignedQuestions[currentQuestionIndex]?.question?.timeLimit || 0)}s</span>
                </div>
                <div className="text-center col-span-2 sm:col-span-1">
                  <span className="font-medium block">Quiz Ends:</span>
                  <span className="text-orange-600 font-semibold text-xs">{new Date(selectedQuiz.endTime).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Error message for answer submission - always visible above navigation */}
              {submitError && (
                <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-3 flex items-center gap-2">
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
                    className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                </div>

                <div className="flex space-x-2">
                  {/* Single Next button that handles both submit and next */}
                  <button
                    onClick={async () => {
                      if (!showQuestionReview) {
                        // For unanswered questions, submit answer first, then move to next
                        await handleSubmitAnswer();
                      } else {
                        // For completed questions, just move to next
                        handleMoveToNextQuestion();
                      }
                    }}
                    disabled={(!showQuestionReview && selectedAnswer === null) || isSubmitting}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
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

      {/* Quiz Results Modal - DISABLED per requirements */}
      {/* {showResultsModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="gaming-card w-full max-w-3xl max-h-[90vh] flex flex-col animate-bounce-in">
            ... results modal content ...
          </div>
        </div>
      )} */}

      {/* Team Rankings Modal - DISABLED per requirements */}
      {/* {showRankingsModal && teamRankings && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="gaming-card w-full max-w-lg max-h-[90vh] flex flex-col animate-bounce-in">
            ... rankings modal content ...
          </div>
        </div>
      )} */}

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