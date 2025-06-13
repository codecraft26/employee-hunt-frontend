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

const UserQuizTab: React.FC = () => {
  // Add CSS animation for progress bar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes progress {
        from { width: 0%; }
        to { width: 100%; }
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
    resetState
  } = useUserQuizzes();

  const [selectedQuiz, setSelectedQuiz] = useState<UserQuiz | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showRankingsModal, setShowRankingsModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [showQuestionReview, setShowQuestionReview] = useState(false);
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean;
    correctAnswer: number;
    selectedAnswer: number;
    score: number;
  } | null>(null);

  // Fetch quizzes on component mount
  useEffect(() => {
    fetchMyQuizzes();
  }, [fetchMyQuizzes]);

  // Timer for current question
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

  const handleStartQuiz = async (quiz: UserQuiz) => {
    try {
      setSelectedQuiz(quiz);
      setQuizStartTime(new Date());
      
      // Fetch the full quiz details and assigned questions
      await getQuizById(quiz.id);
      const questions = await getAssignedQuestions(quiz.id);
      
      console.log('Fetched questions:', questions); // Debug log
      
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
        
        setShowQuizModal(true);
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
    }
  };

  const handleViewResults = async (quiz: UserQuiz) => {
    setSelectedQuiz(quiz);
    await getQuizById(quiz.id);
    setShowResultsModal(true);
  };

  const handleViewRankings = async (quiz: UserQuiz) => {
    setSelectedQuiz(quiz);
    await getTeamRankings(quiz.id);
    setShowRankingsModal(true);
  };

  const handleSubmitAnswer = async () => {
    const currentQuestion = getCurrentQuestion();
    
    if (selectedAnswer === null || !selectedQuiz || !currentQuestion || currentQuestion.isCompleted) {
      return;
    }

    setIsSubmitting(true);
    
    const timeTaken = (currentQuestion.question?.timeLimit || 30) - timeRemaining;
    
    try {
      const success = await submitAnswer(selectedQuiz.id, currentQuestion.id, {
        selectedOption: selectedAnswer,
        timeTaken: timeTaken
      });

      if (success) {
        // Get the updated question data from the assignedQuestions state
        const updatedQuestion = assignedQuestions.find(q => q.id === currentQuestion.id);
        
        if (updatedQuestion) {
          // Show immediate feedback
          setFeedbackData({
            isCorrect: updatedQuestion.isCorrect || false,
            correctAnswer: updatedQuestion.question?.correctAnswer || 0,
            selectedAnswer: selectedAnswer,
            score: updatedQuestion.score || 0
          });
          setShowImmediateFeedback(true);
          
          // Auto-move to next question after 2.5 seconds
          setTimeout(() => {
            setShowImmediateFeedback(false);
            setFeedbackData(null);
            handleMoveToNextQuestion();
          }, 2500);
        } else {
          // Fallback: move to next question immediately
          handleMoveToNextQuestion();
        }
      }
      
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setShowImmediateFeedback(false);
      setFeedbackData(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveToNextQuestion = () => {
    const completionStatus = getQuizCompletionStatus();
    
    // Check if all questions are now completed
    if (completionStatus.isAllCompleted) {
      // Quiz completed
      setShowQuizModal(false);
      setShowResultsModal(true);
      fetchMyQuizzes(); // Refresh quiz list
      return;
    }
    
    // Find next unanswered question
    const nextUnansweredIndex = findNextUnansweredQuestion(currentQuestionIndex + 1);
    
    if (nextUnansweredIndex !== -1) {
      // Move to next unanswered question
      setCurrentQuestionIndex(nextUnansweredIndex);
      setSelectedAnswer(null);
      setShowQuestionReview(false);
      
      const nextQuestion = assignedQuestions[nextUnansweredIndex];
      const timeLimit = nextQuestion?.question?.timeLimit || 30;
      setTimeRemaining(typeof timeLimit === 'number' ? timeLimit : parseInt(timeLimit) || 30);
    } else {
      // No more unanswered questions, but move to next question for review
      if (currentQuestionIndex < assignedQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        const nextQuestion = assignedQuestions[currentQuestionIndex + 1];
        setSelectedAnswer(nextQuestion?.userAnswer || null);
        setShowQuestionReview(true);
        setTimeRemaining(0);
      } else {
        // All questions reviewed, finish quiz
        setShowQuizModal(false);
        setShowResultsModal(true);
        fetchMyQuizzes();
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
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

  const handleAnswerSelection = async (optionIndex: number) => {
    if (showQuestionReview || showImmediateFeedback || isSubmitting) return;
    
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !selectedQuiz || currentQuestion.isCompleted) return;
    
    setSelectedAnswer(optionIndex);
    setIsSubmitting(true);
    
    const timeTaken = (currentQuestion.question?.timeLimit || 30) - timeRemaining;
    
    try {
      const success = await submitAnswer(selectedQuiz.id, currentQuestion.id, {
        selectedOption: optionIndex,
        timeTaken: timeTaken
      });

      if (success) {
        // Get the updated question data from the assignedQuestions state
        const updatedQuestion = assignedQuestions.find(q => q.id === currentQuestion.id);
        
        if (updatedQuestion) {
          // Show immediate feedback
          setFeedbackData({
            isCorrect: Boolean(updatedQuestion.isCorrect),
            correctAnswer: Number(updatedQuestion.question?.correctAnswer || 0),
            selectedAnswer: optionIndex,
            score: Number(updatedQuestion.score || 0)
          });
          setShowImmediateFeedback(true);
          
          // Auto-move to next question after 2.5 seconds
          setTimeout(() => {
            setShowImmediateFeedback(false);
            setFeedbackData(null);
            handleMoveToNextQuestion();
          }, 2500);
        } else {
          // Fallback: move to next question immediately
          handleMoveToNextQuestion();
        }
      }
      
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setShowImmediateFeedback(false);
      setFeedbackData(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseQuiz = () => {
    setShowQuizModal(false);
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setTimeRemaining(0);
    setQuizStartTime(null);
    setShowQuestionReview(false);
    setShowImmediateFeedback(false);
    setFeedbackData(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Quizzes</h2>
          <p className="text-gray-600">Test your knowledge and compete with your team</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Quizzes Grid */}
      {loading && quizzes.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-6 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-20 mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-8 bg-gray-300 rounded"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes available</h3>
          <p className="text-gray-600 mb-4">Check back later for new quizzes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const progress = getQuizProgress(quiz);
            const canStart = canStartQuiz(quiz);
            const displayStatus = getQuizDisplayStatus(quiz);
            const expired = displayStatus === 'EXPIRED';
            
            return (
              <div key={quiz.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                      <div className="flex items-center space-x-2 mb-4">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-full ${getQuizStatusColor(displayStatus)}`}>
                          {getStatusIcon(displayStatus)}
                          <span>{displayStatus}</span>
                        </span>
                        {quiz.isCompleted && (
                          <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            <Trophy className="h-3 w-3" />
                            <span>Completed</span>
                          </span>
                        )}
                        {expired && (
                          <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            <Clock className="h-3 w-3" />
                            <span>Expired</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Progress Bar */}
                    {quiz.status === 'ACTIVE' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{String(progress.completed)}/{String(progress.total)} questions</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Questions</p>
                        <p className="font-medium">{quiz.questionsPerParticipant}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Points</p>
                        <p className="font-medium">{quiz.maxScore || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Participants</p>
                        <p className="font-medium">{quiz.totalParticipants}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Your Score</p>
                        <p className="font-medium">{quiz.userScore !== undefined ? quiz.userScore : '-'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Schedule</p>
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Start: {formatQuizDate(quiz.startTime)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>End: {formatQuizDate(quiz.endTime)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between space-x-2">
                    {canStart && displayStatus === 'ACTIVE' && (
                      <button 
                        onClick={() => handleStartQuiz(quiz)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Play className="h-4 w-4" />
                        <span>{progress.completed > 0 ? 'Continue' : 'Start Quiz'}</span>
                      </button>
                    )}
                    
                    {displayStatus === 'UPCOMING' && (
                      <button 
                        disabled
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Clock className="h-4 w-4" />
                        <span>Upcoming</span>
                      </button>
                    )}
                    
                    {quiz.isCompleted && (
                      <>
                        <button 
                          onClick={() => handleViewResults(quiz)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1 text-sm"
                        >
                          <Award className="h-4 w-4" />
                          <span>Results</span>
                        </button>
                        <button 
                          onClick={() => handleViewRankings(quiz)}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1 text-sm"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Rankings</span>
                        </button>
                      </>
                    )}
                    
                    {expired && !quiz.isCompleted && (
                      <button 
                        disabled
                        className="flex-1 px-4 py-2 bg-red-300 text-red-700 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Clock className="h-4 w-4" />
                        <span>Expired</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quiz Taking Modal */}
      {showQuizModal && selectedQuiz && assignedQuestions.length > 0 && currentQuestionIndex < assignedQuestions.length && assignedQuestions[currentQuestionIndex] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedQuiz.title}</h3>
                <p className="text-gray-600">Question {currentQuestionIndex + 1} of {assignedQuestions.length}</p>
                {showQuestionReview && (
                  <p className="text-sm text-blue-600 mt-1">Review Mode - Already Answered</p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                {!showQuestionReview && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Time Remaining</p>
                    <p className={`text-lg font-bold ${timeRemaining <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                )}
                {showQuestionReview && (
                  <div className="text-right">
                    <p className="text-sm text-green-600">Completed</p>
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Answered</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleCloseQuiz}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / assignedQuestions.length) * 100}%` }}
                ></div>
              </div>

              {/* Question Status Indicator */}
              {showQuestionReview && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Question Already Answered</p>
                      <p className="text-sm text-green-700">
                        Score: {assignedQuestions[currentQuestionIndex]?.score || 0} points
                        {assignedQuestions[currentQuestionIndex]?.isCorrect !== undefined && (
                          <span className="ml-2">
                            {assignedQuestions[currentQuestionIndex].isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Immediate Feedback Overlay */}
              {showImmediateFeedback && feedbackData && (
                <div className={`border-2 rounded-lg p-4 ${
                  feedbackData.isCorrect 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {feedbackData.isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      <p className={`font-bold text-lg ${
                        feedbackData.isCorrect ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {feedbackData.isCorrect ? 'Correct!' : 'Incorrect!'}
                      </p>
                      <p className={`text-sm ${
                        feedbackData.isCorrect ? 'text-green-700' : 'text-red-700'
                      }`}>
                        Points earned: +{feedbackData.score || 0}
                      </p>
                    </div>
                  </div>
                  {!feedbackData.isCorrect && (
                    <p className="text-sm text-red-700">
                      Correct answer: <span className="font-medium">
                        {String.fromCharCode(65 + feedbackData.correctAnswer)} - {assignedQuestions[currentQuestionIndex]?.question?.options[feedbackData.correctAnswer]}
                      </span>
                    </p>
                  )}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-2500"
                        style={{ 
                          animation: 'progress 2.5s linear forwards',
                          width: '0%'
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Moving to next question...</p>
                  </div>
                </div>
              )}

              {/* Question */}
              <div className={`rounded-lg p-6 ${
                showImmediateFeedback 
                  ? (feedbackData?.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200')
                  : showQuestionReview 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50'
              }`}>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  {assignedQuestions[currentQuestionIndex]?.question?.question || 'Loading question...'}
                </h4>
                
                <div className="space-y-3">
                  {assignedQuestions[currentQuestionIndex]?.question?.options?.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    
                    // Ensure we're comparing numbers properly
                    const currentCorrectAnswer = showQuestionReview ? 
                      Number(assignedQuestions[currentQuestionIndex]?.question?.correctAnswer) : 
                      Number(feedbackData?.correctAnswer);
                    const currentUserAnswer = showQuestionReview ? 
                      Number(assignedQuestions[currentQuestionIndex].userAnswer) : 
                      Number(feedbackData?.selectedAnswer);
                    
                    const isCorrect = (showQuestionReview || showImmediateFeedback) && 
                      (currentCorrectAnswer === index);
                    const isUserAnswer = (showQuestionReview || showImmediateFeedback) && 
                      (currentUserAnswer === index);
                    
                    let buttonStyle = '';
                    let iconStyle = '';
                    
                    if (showImmediateFeedback && feedbackData) {
                      // Immediate feedback styling
                      if (isCorrect && isUserAnswer) {
                        buttonStyle = 'border-green-500 bg-green-100 text-green-900'; // Correct answer user selected
                        iconStyle = 'border-green-500 bg-green-500 text-white';
                      } else if (isCorrect) {
                        buttonStyle = 'border-green-500 bg-green-50 text-green-800'; // Correct answer
                        iconStyle = 'border-green-500 bg-green-500 text-white';
                      } else if (isUserAnswer) {
                        buttonStyle = 'border-red-500 bg-red-100 text-red-900'; // Wrong answer user selected
                        iconStyle = 'border-red-500 bg-red-500 text-white';
                      } else {
                        buttonStyle = 'border-gray-200 bg-white text-gray-700'; // Other options
                        iconStyle = 'border-gray-300';
                      }
                    } else if (showQuestionReview) {
                      // Review mode styling
                      if (isCorrect && isUserAnswer) {
                        buttonStyle = 'border-green-500 bg-green-100 text-green-900'; // Correct answer user selected
                        iconStyle = 'border-green-500 bg-green-500 text-white';
                      } else if (isCorrect) {
                        buttonStyle = 'border-green-500 bg-green-50 text-green-800'; // Correct answer
                        iconStyle = 'border-green-500 bg-green-500 text-white';
                      } else if (isUserAnswer) {
                        buttonStyle = 'border-red-500 bg-red-100 text-red-900'; // Wrong answer user selected
                        iconStyle = 'border-red-500 bg-red-500 text-white';
                      } else {
                        buttonStyle = 'border-gray-200 bg-white text-gray-900'; // Other options
                        iconStyle = 'border-gray-300';
                      }
                    } else {
                      // Normal active mode styling
                      buttonStyle = isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300';
                      iconStyle = isSelected 
                        ? 'border-blue-500 bg-blue-500 text-white' 
                        : 'border-gray-300';
                    }

                    const isDisabled = showQuestionReview || showImmediateFeedback || isSubmitting;

                    return (
                      <button
                        key={index}
                        onClick={() => !isDisabled && handleAnswerSelection(index)}
                        disabled={isDisabled}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${buttonStyle} ${
                          isDisabled ? 'cursor-default opacity-75' : 'cursor-pointer hover:shadow-sm'
                        } ${isSubmitting ? 'pointer-events-none' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${iconStyle}`}>
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span>{option}</span>
                          </div>
                          {(showQuestionReview || showImmediateFeedback) && (
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
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Points: {String(assignedQuestions[currentQuestionIndex]?.question?.points || 0)}</span>
                <span>Time Limit: {String(assignedQuestions[currentQuestionIndex]?.question?.timeLimit || 0)}s</span>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === assignedQuestions.length - 1}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>

                <div className="flex space-x-2">
                  {/* Skip button for unanswered questions */}
                  {!showQuestionReview && !showImmediateFeedback && (
                    <button
                      onClick={() => handleMoveToNextQuestion()}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <SkipForward className="h-4 w-4" />
                      <span>Skip</span>
                    </button>
                  )}

                  {/* Submit button for unanswered questions */}
                  {!showQuestionReview && !showImmediateFeedback && (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null || isSubmitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                      <span>
                        {(() => {
                          const completion = getQuizCompletionStatus();
                          if (completion.remaining === 1) {
                            return 'Finish Quiz';
                          } else {
                            return 'Submit Answer';
                          }
                        })()}
                      </span>
                      {(() => {
                        const completion = getQuizCompletionStatus();
                        return completion.remaining > 1 && <ArrowRight className="h-4 w-4" />;
                      })()}
                    </button>
                  )}

                  {/* Continue button for completed questions */}
                  {(showQuestionReview || showImmediateFeedback) && (
                    <button
                      onClick={showImmediateFeedback ? undefined : handleMoveToNextQuestion}
                      disabled={showImmediateFeedback}
                      className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
                        showImmediateFeedback 
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      <span>
                        {showImmediateFeedback ? 'Please wait...' : (() => {
                          const nextUnanswered = findNextUnansweredQuestion(currentQuestionIndex + 1);
                          if (nextUnanswered === -1) {
                            return currentQuestionIndex === assignedQuestions.length - 1 ? 'Finish Review' : 'Continue Review';
                          } else {
                            return 'Continue to Unanswered';
                          }
                        })()}
                      </span>
                      {!showImmediateFeedback && <ArrowRight className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Quiz Status Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Quiz Progress:</span>
                  <span className="font-medium">
                    {getQuizCompletionStatus().completed} of {getQuizCompletionStatus().total} questions completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(getQuizCompletionStatus().completed / getQuizCompletionStatus().total) * 100}%` }}
                  ></div>
                </div>
                {getQuizCompletionStatus().remaining > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {getQuizCompletionStatus().remaining} question(s) remaining
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Results Modal */}
      {showResultsModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quiz Results</h3>
              <button
                onClick={() => setShowResultsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                <h4 className="text-xl font-bold text-gray-900">{selectedQuiz.title}</h4>
                <p className="text-gray-600">{selectedQuiz.description}</p>
                
                {/* Show winning team if available */}
                {selectedQuiz.winningTeam && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Quiz Winner</p>
                        <p className="text-lg font-bold text-yellow-900">{selectedQuiz.winningTeam.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {selectedQuiz.userScore || 0}
                  </p>
                  <p className="text-gray-600">out of {selectedQuiz.maxScore || 0} points</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedQuiz.maxScore ? Math.round(((selectedQuiz.userScore || 0) / selectedQuiz.maxScore) * 100) : 0}% accuracy
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">Questions</p>
                  <p className="font-semibold">{selectedQuiz.questionsPerParticipant}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Your Rank</p>
                  <p className="font-semibold">#{selectedQuiz.teamRank || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Total Teams</p>
                  <p className="font-semibold">{selectedQuiz.totalTeams}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Participants</p>
                  <p className="font-semibold">{selectedQuiz.totalParticipants}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewRankings(selectedQuiz)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>View Rankings</span>
                </button>
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Rankings Modal */}
      {showRankingsModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Team Rankings</h3>
              <button
                onClick={() => setShowRankingsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-gray-900">{selectedQuiz.title}</h4>
                <p className="text-gray-600">Final Team Standings</p>
              </div>

              {teamRankings.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No rankings available yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamRankings.map((team, index) => (
                    <div 
                      key={team.teamId}
                      className={`p-4 rounded-lg border-2 ${
                        index === 0 ? 'border-yellow-200 bg-yellow-50' :
                        index === 1 ? 'border-gray-200 bg-gray-50' :
                        index === 2 ? 'border-orange-200 bg-orange-50' :
                        'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-500 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {index === 0 ? <Trophy className="h-4 w-4" /> :
                             index === 1 ? <Medal className="h-4 w-4" /> :
                             index === 2 ? <Award className="h-4 w-4" /> :
                             team.rank}
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">{String(team.teamName || '')}</h5>
                            <p className="text-sm text-gray-600">
                              {String(team.completedParticipants || 0)}/{String(team.totalParticipants || 0)} completed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{String(team.totalScore || 0)}</p>
                          <p className="text-sm text-gray-600">
                            Avg: {String(Math.round(team.averageScore || 0))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowRankingsModal(false)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserQuizTab;