'use client';

import React, { lazy, useCallback } from 'react';
import OptimizedAdminPageLayout from '../../../components/shared/OptimizedAdminPageLayout';

// Lazy load the QuizzesTab component
const QuizzesTab = lazy(() => import('../../../components/tabs/QuizzesTab'));

export default function QuizzesPage() {
  // Memoized quiz handlers
  const handleCreateQuiz = useCallback(() => {
    console.log('Create quiz');
    // TODO: API call to create quiz
  }, []);

  const handleViewQuiz = useCallback((quizId: string) => {
    console.log(`View quiz: ${quizId}`);
    // TODO: Navigate to quiz details
  }, []);

  const handleEditQuiz = useCallback((quizId: string) => {
    console.log(`Edit quiz: ${quizId}`);
    // TODO: Navigate to quiz edit form
  }, []);

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