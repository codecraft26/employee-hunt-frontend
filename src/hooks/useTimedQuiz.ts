'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  TimedQuizSession,
  TimedQuizSessionStatus,
  TimedQuizCurrentQuestion,
  StartTimedQuizResponse,
  SubmitTimedAnswerRequest,
  SubmitTimedAnswerResponse,
  TimedQuizSessionStatusResponse,
  TimedQuizCurrentQuestionResponse,
  QuizQuestion
} from '../types/quiz';
import { UserQuiz } from './useUserQuizzes';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useTimedQuiz = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<TimedQuizSessionStatus | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<TimedQuizCurrentQuestion | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<TimedQuizSession | null>(null);
  
  // Refs for timer management
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers when component unmounts or quiz ends
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    clearTimers();
    setSessionStatus(null);
    setCurrentQuestion(null);
    setTimeRemaining(30);
    setSelectedAnswer(null);
    setIsSubmitting(false);
    setSession(null);
    setError(null);
  }, [clearTimers]);

  // Get quiz session status
  const getSessionStatus = useCallback(async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<TimedQuizSessionStatusResponse>(`/quizzes/${quizId}/session-status`);
      if (response.data.success) {
        setSessionStatus(response.data.data);
        if (response.data.data.session) {
          setSession(response.data.data.session);
        }
        return response.data.data;
      } else {
        throw new Error('Failed to get session status');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get session status';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start timed quiz session
  const startTimedQuiz = useCallback(async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<StartTimedQuizResponse>(`/quizzes/${quizId}/start-timed`);
      if (response.data.success) {
        const data = response.data.data;
        
        // Update session status
        await getSessionStatus(quizId);
        
        // Set current question
        setCurrentQuestion({
          question: data.currentQuestion,
          questionNumber: data.questionNumber,
          totalQuestions: data.totalQuestions,
          timeRemaining: data.timeLimit,
          isCompleted: false
        });
        
        // Start 30-second timer
        setTimeRemaining(data.timeLimit);
        setSelectedAnswer(null);
        
        return data;
      } else {
        throw new Error(response.data.message || 'Failed to start quiz');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to start quiz';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getSessionStatus]);

  // Get current question
  const getCurrentQuestion = useCallback(async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<TimedQuizCurrentQuestionResponse>(`/quizzes/${quizId}/current-question`);
      if (response.data.success) {
        setCurrentQuestion(response.data.data);
        
        // Reset timer if there's time remaining and quiz not completed
        if (!response.data.data.isCompleted && response.data.data.timeRemaining > 0) {
          setTimeRemaining(response.data.data.timeRemaining);
        } else if (response.data.data.isCompleted) {
          clearTimers();
          setTimeRemaining(0);
        }
        
        return response.data.data;
      } else {
        throw new Error('Failed to get current question');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get current question';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearTimers]);

  // Submit timed answer
  const submitTimedAnswer = useCallback(async (quizId: string, selectedOption?: number) => {
    if (isSubmitting) return null;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const requestData: SubmitTimedAnswerRequest = {};
      // Always include selectedOption, even if undefined (for null/timeout answers)
      requestData.selectedOption = selectedOption;
      
      const response = await api.post<SubmitTimedAnswerResponse>(
        `/quizzes/${quizId}/submit-timed-answer`,
        requestData
      );
      
      if (response.data.success) {
        const data = response.data.data;
        
        // Clear current timers
        clearTimers();
        
        // Update current question based on response
        if (data.isQuizCompleted) {
          setCurrentQuestion({
            question: undefined,
            questionNumber: data.questionNumber,
            totalQuestions: data.totalQuestions,
            timeRemaining: 0,
            isCompleted: true
          });
          setTimeRemaining(0);
        } else if (data.nextQuestion) {
          // Move to next question and restart timer
          setCurrentQuestion({
            question: data.nextQuestion,
            questionNumber: data.questionNumber,
            totalQuestions: data.totalQuestions,
            timeRemaining: 30,
            isCompleted: false
          });
          setTimeRemaining(30);
          
          console.log('Moving to next question:', data.questionNumber);
        } else {
          // If no next question but quiz not completed, something went wrong
          console.warn('No next question provided but quiz not completed');
        }
        
        // Reset selected answer for next question
        setSelectedAnswer(null);
        
        // Update session status
        await getSessionStatus(quizId);
        
        return data;
      } else {
        throw new Error(response.data.message || 'Failed to submit answer');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit answer';
      setError(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, clearTimers, getSessionStatus]);

  // Auto-submit when time runs out
  const handleAutoSubmit = useCallback(async (quizId: string) => {
    if (!isSubmitting && currentQuestion && !currentQuestion.isCompleted) {
      console.log('Auto-submitting due to timeout with null answer');
      // Submit null/undefined for timeout - don't use selectedAnswer
      await submitTimedAnswer(quizId, undefined);
    }
  }, [isSubmitting, currentQuestion, submitTimedAnswer]);

  // Start 30-second countdown timer
  const startTimer = useCallback((quizId: string) => {
    clearTimers();
    
    if (timeRemaining <= 0 || !currentQuestion || currentQuestion.isCompleted) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - auto submit
          clearTimers();
          handleAutoSubmit(quizId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [timeRemaining, currentQuestion, clearTimers, handleAutoSubmit]);

  // Stop timer
  const stopTimer = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  // Check if quiz has expired
  const isQuizExpired = useCallback((quiz: UserQuiz) => {
    const now = new Date();
    const endTime = new Date(quiz.endTime);
    return now > endTime;
  }, []);

  // Check if user can start quiz
  const canStartQuiz = useCallback((quiz: UserQuiz, sessionStatus: TimedQuizSessionStatus | null) => {
    if (!sessionStatus) return false;
    
    // Check if quiz is expired
    if (isQuizExpired(quiz)) return false;
    
    // Check if user has already started (one-time attempt)
    if (sessionStatus.hasStarted) return false;
    
    // Check if quiz is active
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);
    
    return now >= startTime && now <= endTime && quiz.status === 'ACTIVE' && sessionStatus.canStart;
  }, [isQuizExpired]);

  // Format time for display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get urgency level based on time remaining
  const getTimeUrgency = useCallback((seconds: number) => {
    if (seconds <= 5) return 'critical';
    if (seconds <= 10) return 'high';
    if (seconds <= 15) return 'medium';
    return 'normal';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    // State
    loading,
    error,
    sessionStatus,
    currentQuestion,
    timeRemaining,
    selectedAnswer,
    isSubmitting,
    session,
    
    // Actions
    getSessionStatus,
    startTimedQuiz,
    getCurrentQuestion,
    submitTimedAnswer,
    handleAutoSubmit,
    startTimer,
    stopTimer,
    setSelectedAnswer,
    clearError,
    resetState,
    
    // Utilities
    canStartQuiz,
    isQuizExpired,
    formatTime,
    getTimeUrgency,
    
    // Timer management
    clearTimers
  };
}; 