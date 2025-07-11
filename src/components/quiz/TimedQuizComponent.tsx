'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Timer,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Trophy,
  Target,
  ArrowRight,
  X,
  Users,
  Star,
  Crown,
  BarChart3,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { useTimedQuiz } from '../../hooks/useTimedQuiz';
import { UserQuiz } from '../../hooks/useUserQuizzes';

interface TimedQuizComponentProps {
  quiz: UserQuiz;
  onClose: () => void;
  onComplete: (score: number) => void;
}

// Enhanced feedback data interface
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
}

const TimedQuizComponent: React.FC<TimedQuizComponentProps> = ({
  quiz,
  onClose,
  onComplete
}) => {
  const {
    loading,
    error,
    sessionStatus,
    currentQuestion,
    timeRemaining,
    selectedAnswer,
    isSubmitting,
    session,
    getSessionStatus,
    startTimedQuiz,
    getCurrentQuestion,
    submitTimedAnswer,
    startTimer,
    stopTimer,
    setSelectedAnswer,
    clearError,
    resetState,
    canStartQuiz,
    isQuizExpired,
    formatTime,
    getTimeUrgency
  } = useTimedQuiz();

  const [quizStarted, setQuizStarted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Enhanced answer feedback state with comprehensive data
  const [answerFeedback, setAnswerFeedback] = useState<EnhancedFeedbackData | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  
  // Performance tracking
  const [performanceStreak, setPerformanceStreak] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Initialize component - check session status
  useEffect(() => {
    const initialize = async () => {
      await getSessionStatus(quiz.id);
    };
    initialize();
  }, [quiz.id, getSessionStatus]);

  // Start timer when question is available and quiz is started
  useEffect(() => {
    if (quizStarted && currentQuestion && !currentQuestion.isCompleted && timeRemaining > 0) {
      console.log('Starting timer for question:', currentQuestion.questionNumber);
      startTimer(quiz.id);
    }
    
    return () => {
      stopTimer();
    };
  }, [quizStarted, currentQuestion?.questionNumber, startTimer, stopTimer, quiz.id]);

  // Reset feedback state when question changes
  useEffect(() => {
    if (currentQuestion) {
      setAnswerFeedback(null);
      setIsAnswerSubmitted(false);
    }
  }, [currentQuestion?.questionNumber]);

  // Simplified feedback animation sequence - just visual signals
  useEffect(() => {
    if (answerFeedback?.showFeedback) {
      // Show visual feedback for 1.5 seconds then auto-advance
      const feedbackTimer = setTimeout(() => {
        handleFeedbackComplete();
      }, 1500); // Reduced time for quick feedback
      
      return () => clearTimeout(feedbackTimer);
    }
  }, [answerFeedback?.showFeedback]);



  // Handle feedback completion
  const handleFeedbackComplete = useCallback(() => {
    console.log('⏰ Enhanced feedback complete - Auto-advancing...');
    setAnswerFeedback(null);
    setIsAnswerSubmitted(false);
    
    // Check if quiz is completed
    if (session?.isCompleted) {
      stopTimer();
      const finalScore = session?.totalScore || 0;
      onComplete(finalScore);
    }
  }, [session, stopTimer, onComplete]);

  // Check if quiz is completed
  const isQuizCompleted = currentQuestion?.isCompleted || (session?.isCompleted);

  // Handle starting the quiz
  const handleStartQuiz = useCallback(async () => {
    if (!sessionStatus || !canStartQuiz(quiz, sessionStatus)) {
      return;
    }

    try {
      clearError();
      setSubmitError(null);
      
      const result = await startTimedQuiz(quiz.id);
      if (result) {
        setQuizStarted(true);
      }
    } catch (err: any) {
      console.error('Failed to start quiz:', err);
    }
  }, [sessionStatus, quiz, canStartQuiz, clearError, startTimedQuiz]);

  // Enhanced answer selection with comprehensive feedback
  const handleAnswerSelection = useCallback(async (optionIndex: number) => {
    if (isSubmitting || !currentQuestion || currentQuestion.isCompleted || isAnswerSubmitted) return;
    
    setSelectedAnswer(optionIndex);
    setSubmitError(null);
    setIsAnswerSubmitted(true);
    
    try {
      console.log('🎯 Enhanced Timed Quiz - Submitting answer for option:', optionIndex);
      const result = await submitTimedAnswer(quiz.id, optionIndex);
      
      console.log('📥 Enhanced Timed Quiz - Response received:', result);
      
      if (result) {
        // Update performance tracking
        setTotalQuestions(prev => prev + 1);
        if (result.isCorrect) {
          setCorrectAnswers(prev => prev + 1);
          setPerformanceStreak(prev => prev + 1);
        } else {
          setPerformanceStreak(0);
        }

        // Create simple feedback data for visual signals only
        const correctAnswerIndex = currentQuestion.question?.correctAnswer !== undefined ? 
          Number(currentQuestion.question.correctAnswer) : undefined;
        
        const simpleFeedbackData: EnhancedFeedbackData = {
          isCorrect: result.isCorrect,
          pointsEarned: 0, // Not showing points
          selectedOption: optionIndex,
          correctAnswer: correctAnswerIndex, // Convert to number for proper comparison
          showFeedback: true
        };
        
        console.log('✅ Timed Quiz - Setting visual feedback:', simpleFeedbackData);
        console.log('🔍 Debug - Original correct answer:', currentQuestion.question?.correctAnswer);
        console.log('🔍 Debug - Correct answer (converted):', correctAnswerIndex);
        console.log('🔍 Debug - User selected option:', optionIndex);
        console.log('🔍 Debug - Is correct:', result.isCorrect);
        setAnswerFeedback(simpleFeedbackData);
      }
    } catch (err: any) {
      console.error('Enhanced Timed Quiz - Submit error:', err);
      setSubmitError(err.message || 'Failed to submit answer');
      setIsAnswerSubmitted(false);
      setSelectedAnswer(null);
    }
  }, [isSubmitting, currentQuestion, setSelectedAnswer, isAnswerSubmitted, submitTimedAnswer, quiz.id, timeRemaining, session, totalQuestions, correctAnswers, performanceStreak]);

  // Handle quiz close
  const handleClose = useCallback(() => {
    stopTimer();
    resetState();
    onClose();
  }, [stopTimer, resetState, onClose]);

  // Get timer display style based on urgency
  const getTimerStyle = () => {
    const urgency = getTimeUrgency(timeRemaining);
    
    switch (urgency) {
      case 'critical':
        return 'text-red-600 bg-red-100 animate-pulse';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };



  // Format quiz status message
  const getStatusMessage = () => {
    if (loading) return 'Loading...';
    if (error) return error;
    if (!sessionStatus) return 'Checking quiz status...';
    
    if (isQuizExpired(quiz)) {
      return 'This quiz has expired and is no longer available.';
    }
    
    if (sessionStatus.hasStarted) {
      return 'You have already attempted this quiz. You can only attempt it once.';
    }
    
    if (!canStartQuiz(quiz, sessionStatus)) {
      return sessionStatus.message || 'Quiz is not available for starting.';
    }
    
    return 'Ready to start the timed quiz. You have 30 seconds per question.';
  };

  // Show loading state
  if (loading && !sessionStatus) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <RotateCcw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show pre-start screen
  if (!quizStarted || !currentQuestion) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Quiz Info */}
          <div className="mb-6">
            <p className="text-gray-600 mb-4">{quiz.description}</p>
            
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium text-gray-900">Questions</p>
                <p className="text-lg font-bold text-blue-600">{quiz.totalQuestions}</p>
              </div>
              <div className="text-center">
                <Timer className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <p className="text-sm font-medium text-gray-900">Time per Question</p>
                <p className="text-lg font-bold text-orange-600">30 seconds</p>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className={`p-4 rounded-lg mb-6 ${
            error || isQuizExpired(quiz) || sessionStatus?.hasStarted
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center space-x-2">
              {error || isQuizExpired(quiz) || sessionStatus?.hasStarted ? (
                <XCircle className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <p className="font-medium">{getStatusMessage()}</p>
            </div>
          </div>

          {/* Quiz Features */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quiz Features:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <Clock className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Each question has a 30-second time limit with real-time feedback</span>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Immediate answer feedback with performance metrics</span>
              </li>
              <li className="flex items-start space-x-2">
                <Target className="h-4 w-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                <span>Live accuracy tracking and streak counters</span>
              </li>
              <li className="flex items-start space-x-2">
                <Trophy className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
                <span>Team-based scoring with real-time updates</span>
              </li>
              <li className="flex items-start space-x-2">
                <Star className="h-4 w-4 mt-0.5 text-orange-600 flex-shrink-0" />
                <span>Achievement badges for special accomplishments</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {canStartQuiz(quiz, sessionStatus) && !sessionStatus?.hasStarted && (
              <button
                onClick={handleStartQuiz}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>{loading ? 'Starting...' : 'Start Quiz'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show quiz completed screen
  if (isQuizCompleted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
            <p className="text-gray-600 mb-4">
              You have successfully completed the timed quiz.
            </p>
            
            {/* Enhanced completion stats */}
            {totalQuestions > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Accuracy</p>
                    <p className="font-bold text-lg text-green-600">
                      {Math.round((correctAnswers / totalQuestions) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Best Streak</p>
                    <p className="font-bold text-lg text-blue-600">{performanceStreak}</p>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show main quiz interface
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">


      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
            <p className="text-sm text-gray-600">
              Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
            </p>
          </div>
          
          {/* Timer */}
          <div className={`px-4 py-2 rounded-lg font-bold text-lg ${getTimerStyle()}`}>
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar with Performance Indicators */}
        <div className="px-6 py-2">
          <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <div className="flex items-center space-x-4">
              <span>Accuracy: {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%</span>
              <span>Streak: {performanceStreak}</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(currentQuestion.questionNumber / currentQuestion.totalQuestions) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4 leading-relaxed">
              {currentQuestion.question?.question}
            </h3>
            
            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.question?.options?.map((option, index) => {
                // Enhanced feedback styling
                const showingFeedback = answerFeedback?.showFeedback;
                const isFeedbackAnswer = showingFeedback && answerFeedback?.selectedOption === index;
                const isFeedbackCorrect = showingFeedback && answerFeedback?.isCorrect;
                const isCorrectAnswer = showingFeedback && answerFeedback?.correctAnswer === index;
                
                // Debug logging for wrong answers
                if (showingFeedback && !isFeedbackCorrect) {
                  console.log(`🔍 Option ${index} (${option}):`, {
                    isFeedbackAnswer,
                    isCorrectAnswer,
                    correctAnswerFromFeedback: answerFeedback?.correctAnswer,
                    shouldHighlight: isCorrectAnswer && !isFeedbackCorrect
                  });
                }
                
                let buttonStyle = '';
                let iconStyle = '';
                
                if (showingFeedback && isFeedbackAnswer) {
                  if (isFeedbackCorrect) {
                    buttonStyle = 'border-green-500 bg-green-100 text-green-900 shadow-lg transform scale-[1.02]';
                    iconStyle = 'border-green-500 bg-green-500 text-white';
                  } else {
                    buttonStyle = 'border-red-500 bg-red-100 text-red-900 shadow-lg transform scale-[1.02]';
                    iconStyle = 'border-red-500 bg-red-500 text-white';
                  }
                } else if (showingFeedback && isCorrectAnswer && !isFeedbackCorrect) {
                  // Show correct answer when user was wrong
                  buttonStyle = 'border-green-400 bg-green-50 text-green-800 shadow-md';
                  iconStyle = 'border-green-400 bg-green-400 text-white';
                } else if (showingFeedback) {
                  buttonStyle = 'border-gray-200 bg-gray-50 text-gray-500 opacity-60';
                  iconStyle = 'border-gray-300 text-gray-400';
                } else {
                  buttonStyle = selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm';
                  iconStyle = selectedAnswer === index
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 text-gray-600';
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelection(index)}
                    disabled={isSubmitting || isAnswerSubmitted}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${buttonStyle} ${
                      (isSubmitting || isAnswerSubmitted) ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-300 ${iconStyle}`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {showingFeedback && (isFeedbackAnswer || (isCorrectAnswer && !isFeedbackCorrect)) && (
                        <div className="flex items-center space-x-1">
                          {isFeedbackAnswer && isFeedbackCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600 animate-pulse" />
                          ) : isFeedbackAnswer && !isFeedbackCorrect ? (
                            <XCircle className="h-5 w-5 text-red-600 animate-pulse" />
                          ) : isCorrectAnswer && !isFeedbackCorrect ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">Correct</span>
                            </>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Info */}
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <span className="font-medium block">Time Limit</span>
              <span className="text-green-600 font-semibold">{currentQuestion.question?.timeLimit || 30}s</span>
            </div>
            <div className="text-center">
              <span className="font-medium block">Difficulty</span>
              <span className="text-orange-600 font-semibold capitalize">Medium</span>
            </div>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {submitError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimedQuizComponent; 