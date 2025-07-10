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
  X
} from 'lucide-react';
import { useTimedQuiz } from '../../hooks/useTimedQuiz';
import { UserQuiz } from '../../hooks/useUserQuizzes';

interface TimedQuizComponentProps {
  quiz: UserQuiz;
  onClose: () => void;
  onComplete: (score: number) => void;
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

  // Handle answer selection
  const handleAnswerSelection = useCallback((optionIndex: number) => {
    if (isSubmitting || !currentQuestion || currentQuestion.isCompleted) return;
    
    setSelectedAnswer(optionIndex);
    setSubmitError(null);
  }, [isSubmitting, currentQuestion, setSelectedAnswer]);

  // Handle manual answer submission
  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || currentQuestion.isCompleted || isSubmitting) return;
    
    setSubmitError(null);
    
    try {
      console.log('Manually submitting answer:', selectedAnswer);
      const result = await submitTimedAnswer(quiz.id, selectedAnswer !== null ? selectedAnswer : undefined);
      
      if (result) {
        console.log('Submit result:', result);
        // Check if quiz is completed
        if (result.isQuizCompleted) {
          // Stop timer and show completion
          stopTimer();
          const finalScore = session?.totalScore || 0;
          onComplete(finalScore);
        }
        // If not completed, timer will auto-restart via useEffect when currentQuestion updates
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setSubmitError(err.message || 'Failed to submit answer');
    }
  }, [currentQuestion, isSubmitting, submitTimedAnswer, quiz.id, selectedAnswer, stopTimer, session, onComplete]);

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

          {/* Rules */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quiz Rules:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <Clock className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Each question has a 30-second time limit</span>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Questions auto-advance when time expires</span>
              </li>
              <li className="flex items-start space-x-2">
                <Target className="h-4 w-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                <span>No points deducted for timeout (unanswered questions)</span>
              </li>
              <li className="flex items-start space-x-2">
                <Trophy className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
                <span>You can only attempt this quiz once</span>
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
            
            {/* Score details removed for privacy */}
            
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

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
              {currentQuestion.question?.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelection(index)}
                  disabled={isSubmitting}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Points: <span className="font-semibold text-blue-600">{currentQuestion.question?.points}</span></span>
              <span>Time Limit: <span className="font-semibold text-green-600">30 seconds</span></span>
            </div>
          </div>

          {/* Error Message */}
          {(submitError || error) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 text-red-800">
                <XCircle className="h-5 w-5" />
                <span className="text-sm">{submitError || error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Exit Quiz
            </button>
            
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null || isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Answer'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimedQuizComponent; 