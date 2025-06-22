'use client';

import React, { useState } from 'react';
import OptimizedAdminPageLayout from '../../../components/shared/OptimizedAdminPageLayout';
import QuizzesTab from '../../../components/tabs/QuizzesTab';

export default function AdminQuizzesPage() {
  const [activeTab, setActiveTab] = useState<'management' | 'rankings'>('management');

  const handleCreateQuiz = () => {
    // TODO: Implement create quiz functionality
  };

  const handleViewQuiz = (quizId: string) => {
    // TODO: Implement view quiz functionality
  };

  const handleEditQuiz = (quizId: string) => {
    // TODO: Implement edit quiz functionality
  };

  return (
    <OptimizedAdminPageLayout title="Quizzes Management">
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'management', label: 'Quiz Management', icon: '🎯' },
              { id: 'rankings', label: 'Team Rankings', icon: '🏆' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'management' && (
        <QuizzesTab
          onCreateQuiz={handleCreateQuiz}
          onViewQuiz={handleViewQuiz}
          onEditQuiz={handleEditQuiz}
        />
      )}

     
    </OptimizedAdminPageLayout>
  );
}
