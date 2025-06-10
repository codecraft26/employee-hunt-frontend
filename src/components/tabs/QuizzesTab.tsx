// components/tabs/QuizzesTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trophy,
  Calendar,
  Users,
  Clock,
  Target,
  AlertCircle,
  RefreshCw,
  Award,
  CheckCircle,
  Play,
  X,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { useQuizzes, Quiz, CreateQuizRequest, UpdateQuizRequest, UpdateQuestionRequest } from '../../hooks/useQuizzes';

interface QuizzesTabProps {
  onCreateQuiz?: () => void;
  onViewQuiz?: (quizId: string) => void;
  onEditQuiz?: (quizId: string) => void;
}

const QuizzesTab: React.FC<QuizzesTabProps> = ({ 
  onCreateQuiz: externalOnCreateQuiz,
  onViewQuiz: externalOnViewQuiz,
  onEditQuiz: externalOnEditQuiz
}) => {
  const {
    loading,
    error,
    quizzes,
    createQuiz,
    fetchQuizzes,
    getQuizById,
    declareWinner,
    updateQuiz,
    updateQuestion,
    deleteQuiz,
    publishResults,
    getQuizStats,
    formatQuizDate,
    getQuizStatusColor,
    clearError,
  } = useQuizzes();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [createQuizData, setCreateQuizData] = useState<CreateQuizRequest>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    resultDisplayTime: '',
    questionDistributionType: 'SEQUENTIAL',
    questionsPerParticipant: 1,
    questions: []
  });
  const [editQuizData, setEditQuizData] = useState<UpdateQuizRequest>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    resultDisplayTime: '',
    questionDistributionType: 'SEQUENTIAL',
    questionsPerParticipant: 1
  });
  const [editQuestionData, setEditQuestionData] = useState<UpdateQuestionRequest>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 10,
    timeLimit: 30
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 10,
    timeLimit: 30
  });

  // Fetch quizzes on component mount
  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowDropdown(null);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  const handleCreateQuiz = () => {
    setShowCreateModal(true);
    // Reset form data
    setCreateQuizData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      resultDisplayTime: '',
      questionDistributionType: 'SEQUENTIAL',
      questionsPerParticipant: 1,
      questions: []
    });
    externalOnCreateQuiz?.();
  };

  const handleSubmitQuiz = async () => {
    if (!createQuizData.title.trim() || !createQuizData.description.trim() || 
        !createQuizData.startTime || !createQuizData.endTime || 
        createQuizData.questions.length === 0) {
      alert('Please fill in all required fields and add at least one question.');
      return;
    }

    // Convert datetime-local to ISO string format
    const quizPayload = {
      ...createQuizData,
      startTime: new Date(createQuizData.startTime).toISOString(),
      endTime: new Date(createQuizData.endTime).toISOString(),
      resultDisplayTime: createQuizData.resultDisplayTime ? 
        new Date(createQuizData.resultDisplayTime).toISOString() : 
        new Date(createQuizData.endTime).toISOString(), // Default to end time if not set
    };

    setIsSubmitting(true);
    try {
      await createQuiz(quizPayload);
      setShowCreateModal(false);
      // Reset form
      setCreateQuizData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        resultDisplayTime: '',
        questionDistributionType: 'SEQUENTIAL',
        questionsPerParticipant: 1,
        questions: []
      });
      alert('Quiz created successfully!');
    } catch (err: any) {
      console.error('Failed to create quiz:', err);
      alert(`Failed to create quiz: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question.trim() || 
        currentQuestion.options.some(opt => !opt.trim())) {
      alert('Please fill in the question and all options.');
      return;
    }

    setCreateQuizData(prev => ({
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
  };

  const handleRemoveQuestion = (index: number) => {
    setCreateQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const handleViewQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowDetailsModal(true);
    setShowDropdown(null);
    externalOnViewQuiz?.(quiz.id);
  };

  const handleEditQuiz = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      setEditQuizData({
        title: quiz.title,
        description: quiz.description,
        startTime: quiz.startTime.slice(0, 16), // Convert to datetime-local format
        endTime: quiz.endTime.slice(0, 16),
        resultDisplayTime: quiz.resultDisplayTime.slice(0, 16),
        questionDistributionType: quiz.questionDistributionType,
        questionsPerParticipant: quiz.questionsPerParticipant
      });
      setShowEditModal(true);
    }
    setShowDropdown(null);
    externalOnEditQuiz?.(quizId);
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
    setShowDropdown(null);
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;

    setIsSubmitting(true);
    try {
      await deleteQuiz(quizToDelete.id);
      setShowDeleteModal(false);
      setQuizToDelete(null);
      alert('Quiz deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete quiz:', err);
      alert(`Failed to delete quiz: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateQuiz = async () => {
    if (!selectedQuiz || !editQuizData.title.trim() || !editQuizData.description.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    // Convert datetime-local to ISO string format
    const quizPayload = {
      ...editQuizData,
      startTime: new Date(editQuizData.startTime).toISOString(),
      endTime: new Date(editQuizData.endTime).toISOString(),
      resultDisplayTime: new Date(editQuizData.resultDisplayTime).toISOString(),
    };

    setIsSubmitting(true);
    try {
      await updateQuiz(selectedQuiz.id, quizPayload);
      setShowEditModal(false);
      setSelectedQuiz(null);
      alert('Quiz updated successfully!');
    } catch (err: any) {
      console.error('Failed to update quiz:', err);
      alert(`Failed to update quiz: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestionId(question.id);
    setEditQuestionData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      points: question.points,
      timeLimit: question.timeLimit
    });
  };

  const handleUpdateQuestion = async () => {
    if (!selectedQuiz || !editingQuestionId) return;

    if (!editQuestionData.question.trim() || editQuestionData.options.some(opt => !opt.trim())) {
      alert('Please fill in the question and all options.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateQuestion(selectedQuiz.id, editingQuestionId, editQuestionData);
      setEditingQuestionId(null);
      alert('Question updated successfully!');
      // Refresh the selected quiz data
      const updatedQuiz = quizzes.find(q => q.id === selectedQuiz.id);
      if (updatedQuiz) {
        setSelectedQuiz(updatedQuiz);
      }
    } catch (err: any) {
      console.error('Failed to update question:', err);
      alert(`Failed to update question: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditQuestionData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 10,
      timeLimit: 30
    });
  };

  const handleDeclareWinner = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to declare the winner for this quiz?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await declareWinner(quizId);
    } catch (err) {
      console.error('Failed to declare winner:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishResults = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to publish the results for this quiz?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await publishResults(quizId);
    } catch (err) {
      console.error('Failed to publish results:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    clearError();
    fetchQuizzes();
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'UPCOMING':
        return <Clock className="h-4 w-4" />;
      case 'ACTIVE':
        return <Play className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'DRAFT':
        return <Edit className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const toggleDropdown = (quizId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setShowDropdown(prevState => prevState === quizId ? null : quizId);
  };

  const canDeleteQuiz = (quiz: Quiz) => {
    // Allow deletion for DRAFT and UPCOMING quizzes
    return quiz.status === 'DRAFT' || quiz.status === 'UPCOMING';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quiz Management</h2>
          <p className="text-gray-600">Create and manage your team quizzes</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleCreateQuiz}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Quiz</span>
          </button>
        </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && quizToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Quiz</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Are you sure you want to delete this quiz?</p>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">{quizToDelete.title}</p>
                <p className="text-sm text-gray-600">{quizToDelete.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>{quizToDelete.totalQuestions} questions</span>
                  <span>•</span>
                  <span>{quizToDelete.totalParticipants} participants</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full ${getQuizStatusColor(quizToDelete.status)}`}>
                    {quizToDelete.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteQuiz}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                <span>{isSubmitting ? 'Deleting...' : 'Delete Quiz'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quiz Modal */}
      {showEditModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit Quiz</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title *</label>
                  <input
                    type="text"
                    value={editQuizData.title}
                    onChange={(e) => setEditQuizData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter quiz title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Questions Per Participant *</label>
                  <input
                    type="number"
                    min="1"
                    value={editQuizData.questionsPerParticipant}
                    onChange={(e) => setEditQuizData(prev => ({ ...prev, questionsPerParticipant: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={editQuizData.description}
                  onChange={(e) => setEditQuizData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter quiz description"
                  rows={3}
                />
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="datetime-local"
                    value={editQuizData.startTime}
                    onChange={(e) => setEditQuizData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input
                    type="datetime-local"
                    value={editQuizData.endTime}
                    onChange={(e) => setEditQuizData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Results Display Time</label>
                  <input
                    type="datetime-local"
                    value={editQuizData.resultDisplayTime}
                    onChange={(e) => setEditQuizData(prev => ({ ...prev, resultDisplayTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Distribution</label>
                <select
                  value={editQuizData.questionDistributionType}
                  onChange={(e) => setEditQuizData(prev => ({ ...prev, questionDistributionType: e.target.value as 'SEQUENTIAL' | 'RANDOM' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="SEQUENTIAL">Sequential</option>
                  <option value="RANDOM">Random</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                * Required fields
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateQuiz}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                  <span>{isSubmitting ? 'Updating...' : 'Update Quiz'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create New Quiz</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title *</label>
                  <input
                    type="text"
                    value={createQuizData.title}
                    onChange={(e) => setCreateQuizData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter quiz title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Questions Per Participant *</label>
                  <input
                    type="number"
                    min="1"
                    value={createQuizData.questionsPerParticipant}
                    onChange={(e) => setCreateQuizData(prev => ({ ...prev, questionsPerParticipant: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={createQuizData.description}
                  onChange={(e) => setCreateQuizData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter quiz description"
                  rows={3}
                />
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="datetime-local"
                    value={createQuizData.startTime}
                    onChange={(e) => setCreateQuizData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input
                    type="datetime-local"
                    value={createQuizData.endTime}
                    onChange={(e) => setCreateQuizData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Results Display Time</label>
                  <input
                    type="datetime-local"
                    value={createQuizData.resultDisplayTime}
                    onChange={(e) => setCreateQuizData(prev => ({ ...prev, resultDisplayTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Distribution</label>
                <select
                  value={createQuizData.questionDistributionType}
                  onChange={(e) => setCreateQuizData(prev => ({ ...prev, questionDistributionType: e.target.value as 'SEQUENTIAL' | 'RANDOM' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="SEQUENTIAL">Sequential</option>
                  <option value="RANDOM">Random</option>
                </select>
              </div>

              {/* Questions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Questions ({createQuizData.questions.length})</h4>
                  <span className="text-sm text-gray-500">Add at least one question</span>
                </div>

                {/* Existing Questions */}
                {createQuizData.questions.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {createQuizData.questions.map((question, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-2">Q{index + 1}. {question.question}</h5>
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
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                              onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                              className="text-indigo-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleQuestionOptionChange(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Select the radio button for the correct answer</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                        <input
                          type="number"
                          min="1"
                          value={currentQuestion.points}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (seconds)</label>
                        <input
                          type="number"
                          min="10"
                          value={currentQuestion.timeLimit}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddQuestion}
                      className="w-full px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                * Required fields
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting || createQuizData.questions.length === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                  <span>{isSubmitting ? 'Creating...' : 'Create Quiz'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quizzes Grid */}
      {loading && quizzes.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
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
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first quiz</p>
          <button 
            onClick={handleCreateQuiz}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-full ${getQuizStatusColor(quiz.status)}`}>
                        {getStatusIcon(quiz.status)}
                        <span>{quiz.status}</span>
                      </span>
                      {quiz.winningTeam && (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          <Trophy className="h-3 w-3" />
                          <span>Winner: {quiz.winningTeam.name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative dropdown-container">
                    <button
                      onClick={(e) => toggleDropdown(quiz.id, e)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {showDropdown === quiz.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewQuiz(quiz);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditQuiz(quiz.id);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit Quiz</span>
                          </button>
                          {canDeleteQuiz(quiz) && (
                            <>
                              <hr className="my-1" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteQuiz(quiz);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete Quiz</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Questions</p>
                      <p className="font-medium">{quiz.totalQuestions}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Per Participant</p>
                      <p className="font-medium">{quiz.questionsPerParticipant}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Teams</p>
                      <p className="font-medium">{quiz.totalTeams}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Participants</p>
                      <p className="font-medium">{quiz.totalParticipants}</p>
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
                      {quiz.resultDisplayTime && (
                        <div className="flex items-center space-x-1">
                          <Award className="h-3 w-3" />
                          <span>Results: {formatQuizDate(quiz.resultDisplayTime)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => handleViewQuiz(quiz)}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    {quiz.status === 'COMPLETED' && !quiz.winningTeam && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeclareWinner(quiz.id);
                        }}
                        disabled={isSubmitting}
                        className="text-yellow-600 hover:text-yellow-700 font-medium text-sm flex items-center space-x-1 disabled:opacity-50"
                      >
                        <Trophy className="h-4 w-4" />
                        <span>Declare Winner</span>
                      </button>
                    )}
                    {quiz.status === 'COMPLETED' && !quiz.isResultPublished && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePublishResults(quiz.id);
                        }}
                        disabled={isSubmitting}
                        className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Publish</span>
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditQuiz(quiz.id);
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    {canDeleteQuiz(quiz) && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuiz(quiz);
                        }}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center space-x-1"
                        title="Delete Quiz"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Details Modal */}
      {showDetailsModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Quiz Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Quiz Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Quiz Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Title:</span>
                      <span className="ml-2 font-medium">{selectedQuiz.title}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Description:</span>
                      <span className="ml-2">{selectedQuiz.description}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getQuizStatusColor(selectedQuiz.status)}`}>
                        {selectedQuiz.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Distribution:</span>
                      <span className="ml-2">{selectedQuiz.questionDistributionType}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-600 font-medium">{selectedQuiz.totalQuestions}</p>
                      <p className="text-blue-800 text-xs">Total Questions</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-green-600 font-medium">{selectedQuiz.totalParticipants}</p>
                      <p className="text-green-800 text-xs">Participants</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-purple-600 font-medium">{selectedQuiz.totalTeams}</p>
                      <p className="text-purple-800 text-xs">Teams</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-orange-600 font-medium">{selectedQuiz.questionsPerParticipant}</p>
                      <p className="text-orange-800 text-xs">Per Participant</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Play className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">Start Time</p>
                      <p className="text-gray-600">{formatQuizDate(selectedQuiz.startTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="font-medium">End Time</p>
                      <p className="text-gray-600">{formatQuizDate(selectedQuiz.endTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="font-medium">Results Display</p>
                      <p className="text-gray-600">{formatQuizDate(selectedQuiz.resultDisplayTime)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Winning Team */}
              {selectedQuiz.winningTeam && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Winning Team</h4>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-6 w-6 text-yellow-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{selectedQuiz.winningTeam.name}</p>
                        <p className="text-sm text-gray-600">{selectedQuiz.winningTeam.description}</p>
                        <p className="text-xs text-gray-500">Score: {selectedQuiz.winningTeam.score}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Questions ({selectedQuiz.questions.length})</h4>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {selectedQuiz.questions.map((question, index) => (
                    <div key={question.id || index} className="p-4 border border-gray-200 rounded-lg">
                      {editingQuestionId === question.id ? (
                        /* Edit Question Form */
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                            <input
                              type="text"
                              value={editQuestionData.question}
                              onChange={(e) => setEditQuestionData(prev => ({ ...prev, question: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                            <div className="space-y-2">
                              {editQuestionData.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`editCorrectAnswer-${question.id}`}
                                    checked={editQuestionData.correctAnswer === optionIndex}
                                    onChange={() => setEditQuestionData(prev => ({ ...prev, correctAnswer: optionIndex }))}
                                    className="text-indigo-600"
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...editQuestionData.options];
                                      newOptions[optionIndex] = e.target.value;
                                      setEditQuestionData(prev => ({ ...prev, options: newOptions }));
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                              <input
                                type="number"
                                min="1"
                                value={editQuestionData.points}
                                onChange={(e) => setEditQuestionData(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (seconds)</label>
                              <input
                                type="number"
                                min="10"
                                value={editQuestionData.timeLimit}
                                onChange={(e) => setEditQuestionData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleCancelEditQuestion}
                              className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleUpdateQuestion}
                              disabled={isSubmitting}
                              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Display Question */
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-900">Q{index + 1}. {question.question}</h5>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>{question.points} pts</span>
                                <span>•</span>
                                <span>{question.timeLimit}s</span>
                              </div>
                              <button
                                onClick={() => handleEditQuestion(question)}
                                className="text-indigo-600 hover:text-indigo-700 p-1"
                                title="Edit question"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {question.options.map((option, optionIndex) => (
                              <div 
                                key={optionIndex}
                                className={`p-2 text-sm rounded ${
                                  optionIndex === question.correctAnswer 
                                    ? 'bg-green-100 text-green-800 font-medium' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {String.fromCharCode(65 + optionIndex)}. {option}
                                {optionIndex === question.correctAnswer && (
                                  <span className="ml-2 text-green-600">✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Created: {formatQuizDate(selectedQuiz.createdAt)}</span>
                  <span>•</span>
                  <span>Updated: {formatQuizDate(selectedQuiz.updatedAt)}</span>
                </div>
                <div className="flex space-x-2">
                  {selectedQuiz.status === 'COMPLETED' && !selectedQuiz.winningTeam && (
                    <button 
                      onClick={() => handleDeclareWinner(selectedQuiz.id)}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Trophy className="h-4 w-4" />
                      <span>Declare Winner</span>
                    </button>
                  )}
                  {selectedQuiz.status === 'COMPLETED' && !selectedQuiz.isResultPublished && (
                    <button 
                      onClick={() => handlePublishResults(selectedQuiz.id)}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Publish Results</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizzesTab;