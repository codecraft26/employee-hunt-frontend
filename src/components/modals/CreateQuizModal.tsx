'use client';

import React, { useState, useCallback } from 'react';
import { X, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { useQuizzes, CreateQuizRequest, QuizQuestion } from '../../hooks/useQuizzes';
import { CreateQuestionRequest } from '../../types/quiz';
import { useToast } from '../shared/ToastContainer';

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [quizData, setQuizData] = useState<CreateQuizRequest>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    resultDisplayTime: '',
    questionOrderMode: 'SEQUENTIAL',
    questionsPerParticipant: 1,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState<Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 10,
    timeLimit: 30
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createQuiz, loading } = useQuizzes();
  const { showSuccess, showError } = useToast();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = useCallback(() => {
    setQuizData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      resultDisplayTime: '',
      questionOrderMode: 'SEQUENTIAL',
      questionsPerParticipant: 1,
      questions: []
    });
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 10,
      timeLimit: 30
    });
    setErrors({});
  }, []);

  // Validation functions
  const validateQuizData = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!quizData.title.trim()) {
      newErrors.title = 'Quiz title is required';
    }

    if (!quizData.description || !quizData.description.trim()) {
      newErrors.description = 'Quiz description is required';
    }

    if (!quizData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!quizData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (quizData.startTime && quizData.endTime) {
      const startDate = new Date(quizData.startTime);
      const endDate = new Date(quizData.endTime);
      
      if (startDate >= endDate) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    const questionsPerParticipant = typeof quizData.questionsPerParticipant === 'string' ? 
      parseInt(quizData.questionsPerParticipant) || 0 : 
      quizData.questionsPerParticipant;
    
    if (questionsPerParticipant < 1) {
      newErrors.questionsPerParticipant = 'Questions per participant must be at least 1';
    }

    if (quizData.questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [quizData]);

  const validateQuestion = useCallback(() => {
    if (!currentQuestion.question.trim()) {
      return 'Question text is required';
    }

    if (currentQuestion.options.some(option => !option.trim())) {
      return 'All options must be filled';
    }

    if (currentQuestion.correctAnswer === null || currentQuestion.correctAnswer === undefined) {
      return 'Please select the correct answer';
    }

    if (currentQuestion.points < 1) {
      return 'Points must be at least 1';
    }

    return null;
  }, [currentQuestion]);

  // Handle form field changes
  const handleQuizDataChange = useCallback((field: keyof CreateQuizRequest, value: any) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleQuestionChange = useCallback((field: keyof Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>, value: any) => {
    setCurrentQuestion(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleOptionChange = useCallback((index: number, value: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  }, []);

  // Add question to quiz
  const handleAddQuestion = useCallback(() => {
    const questionError = validateQuestion();
    if (questionError) {
      showError('Invalid Question', questionError);
      return;
    }

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    // Reset current question
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 10,
      timeLimit: 30
    });

    // Clear questions error
    if (errors.questions) {
      setErrors(prev => ({ ...prev, questions: '' }));
    }
  }, [currentQuestion, validateQuestion, errors.questions, showError]);

  // Remove question from quiz
  const handleRemoveQuestion = useCallback((index: number) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateQuizData()) {
      showError('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    try {
      const success = await createQuiz(quizData);
      if (success) {
        showSuccess('Quiz Created', 'Quiz has been created successfully!');
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      showError('Creation Failed', 'Failed to create quiz. Please try again.');
    }
  }, [quizData, validateQuizData, createQuiz, showSuccess, showError, onSuccess, onClose]);

  // Format datetime for input fields
  const formatDateTimeForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Quiz</h2>
            <p className="text-gray-600 mt-1">Create an interactive quiz for your teams</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Quiz Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => handleQuizDataChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter quiz title"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Questions Per Participant *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quizData.questionsPerParticipant}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      handleQuizDataChange('questionsPerParticipant', '' as any);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue) && numValue > 0) {
                        handleQuizDataChange('questionsPerParticipant', numValue);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '' || parseInt(e.target.value) < 1) {
                      handleQuizDataChange('questionsPerParticipant', 1);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.questionsPerParticipant ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter number of questions"
                />
                {errors.questionsPerParticipant && (
                  <p className="text-red-600 text-sm mt-1">{errors.questionsPerParticipant}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={quizData.description}
                onChange={(e) => handleQuizDataChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter quiz description"
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={quizData.startTime}
                  onChange={(e) => handleQuizDataChange('startTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.startTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  value={quizData.endTime}
                  onChange={(e) => handleQuizDataChange('endTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.endTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Results Display Time
                </label>
                <input
                  type="datetime-local"
                  value={quizData.resultDisplayTime}
                  onChange={(e) => handleQuizDataChange('resultDisplayTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-gray-500 text-xs mt-1">Leave empty to show immediately after end</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Distribution
              </label>
              <select
                value={quizData.questionOrderMode}
                onChange={(e) => handleQuizDataChange('questionOrderMode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="SEQUENTIAL">Sequential (in order)</option>
                <option value="RANDOM">Random</option>
              </select>
            </div>
          </div>

          {/* Questions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Questions ({quizData.questions.length})
              </h3>
              {errors.questions && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.questions}
                </div>
              )}
            </div>

            {/* Existing Questions */}
            {quizData.questions.length > 0 && (
              <div className="space-y-3 mb-6">
                {quizData.questions.map((question, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-2">
                          Q{index + 1}. {question.question}
                        </h5>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {question.options.map((option, optIndex) => (
                            <div 
                              key={optIndex}
                              className={`p-2 text-sm rounded ${
                                optIndex === question.correctAnswer 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option}
                              {optIndex === question.correctAnswer && ' ✓'}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Points: {question.points}</span>
                          <span>Time: {question.timeLimit}s</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveQuestion(index)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Question */}
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-3">Add New Question</h5>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                  <input
                    type="text"
                    value={currentQuestion.question}
                    onChange={(e) => handleQuestionChange('question', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your question"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => handleQuestionChange('correctAnswer', index)}
                          className="text-blue-600"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select the radio button for the correct answer</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                    <input
                      type="number"
                      min="1"
                      value={currentQuestion.points}
                      onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddQuestion}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            * Required fields
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
                              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizModal; 