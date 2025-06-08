// components/tabs/QuizzesTab.tsx
import React from 'react';
import { Plus, Eye, Edit } from 'lucide-react';
import { Quiz } from '../../types/admin';

interface QuizzesTabProps {
  quizzes: Quiz[];
  onCreateQuiz: () => void;
  onViewQuiz: (quizId: number) => void;
  onEditQuiz: (quizId: number) => void;
}

const QuizzesTab: React.FC<QuizzesTabProps> = ({ 
  quizzes, 
  onCreateQuiz, 
  onViewQuiz, 
  onEditQuiz 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quiz Management</h2>
        <button 
          onClick={onCreateQuiz}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Quiz</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(quiz.status)}`}>
                    {quiz.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Questions</p>
                    <p className="font-medium">{quiz.questions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time Limit</p>
                    <p className="font-medium">{quiz.timeLimit}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Responses</p>
                    <p className="font-medium">{quiz.responses}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Score</p>
                    <p className="font-medium">{quiz.avgScore}%</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Assigned Teams</p>
                  <div className="flex flex-wrap gap-1">
                    {quiz.teams.map((team, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                        {team}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
              <button 
                onClick={() => onViewQuiz(quiz.id)}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>
              <button 
                onClick={() => onEditQuiz(quiz.id)}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizzesTab;