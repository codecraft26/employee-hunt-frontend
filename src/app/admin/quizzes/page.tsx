'use client';

import React from 'react';
import OptimizedAdminPageLayout from '../../../components/shared/OptimizedAdminPageLayout';
import QuizzesTab from '../../../components/tabs/QuizzesTab';

export default function AdminQuizzesPage() {
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
      <QuizzesTab
        onCreateQuiz={handleCreateQuiz}
        onViewQuiz={handleViewQuiz}
        onEditQuiz={handleEditQuiz}
      />
    </OptimizedAdminPageLayout>
  );
} 