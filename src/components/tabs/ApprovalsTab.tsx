// components/tabs/ApprovalsTab.tsx
import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Camera,
  Target,
  MapPin
} from 'lucide-react';
import { PendingApproval } from '../../types/admin';

interface ApprovalsTabProps {
  pendingApprovals: PendingApproval[];
  onApprove: (approvalId: number) => void;
  onReject: (approvalId: number) => void;
  onAddFeedback: (approvalId: number) => void;
}

const ApprovalsTab: React.FC<ApprovalsTabProps> = ({ 
  pendingApprovals, 
  onApprove, 
  onReject, 
  onAddFeedback 
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'treasure-clue': return Camera;
      case 'quiz-dispute': return Target;
      default: return MapPin;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
          {pendingApprovals.length} items pending
        </span>
      </div>

      <div className="space-y-4">
        {pendingApprovals.map((item) => {
          const IconComponent = getTypeIcon(item.type);
          return (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <IconComponent className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">
                        {item.team} • {item.user} • {item.submittedAt}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{item.description}</p>
                  
                  {item.image && (
                    <div className="mb-4">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {item.type === 'treasure-clue' && item.clueNumber && (
                    <div className="text-sm text-gray-600 mb-3">
                      Clue #{item.clueNumber} submission
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => onApprove(item.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button 
                      onClick={() => onReject(item.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    <button 
                      onClick={() => onAddFeedback(item.id)}
                      className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Add Feedback</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalsTab;