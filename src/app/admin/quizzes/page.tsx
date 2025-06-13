'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import AdminHeader from '../../../components/admin/AdminHeader';
import QuizzesTab from '../../../components/tabs/QuizzesTab';

// Mock stats for header
const mockStats = {
  pendingApprovals: 7
};

export default function QuizzesPage() {
  const { user, logout: handleLogout } = useAuth();
  const router = useRouter();

  // Quiz handlers
  const handleCreateQuiz = () => {
    console.log('Create quiz');
    // TODO: API call to create quiz
  };

  const handleViewQuiz = (quizId: string) => {
    console.log(`View quiz: ${quizId}`);
    // TODO: Navigate to quiz details
  };

  const handleEditQuiz = (quizId: string) => {
    console.log(`Edit quiz: ${quizId}`);
    // TODO: Navigate to quiz edit form
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        pendingApprovals={mockStats.pendingApprovals}
        onLogout={handleLogout}
        userName={user?.name || user?.email || 'Admin'}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        <QuizzesTab
          onCreateQuiz={handleCreateQuiz}
          onViewQuiz={handleViewQuiz}
          onEditQuiz={handleEditQuiz}
        />
      </div>
    </div>
  );
} 