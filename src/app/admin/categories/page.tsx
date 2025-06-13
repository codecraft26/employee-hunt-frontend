'use client';

import React, { lazy, useCallback } from 'react';
import OptimizedAdminPageLayout from '../../../components/shared/OptimizedAdminPageLayout';

// Lazy load the CategoriesTab component
const CategoriesTab = lazy(() => import('../../../components/tabs/CategoriesTab'));

export default function CategoriesPage() {
  // Memoized category handlers
  const handleCreateCategory = useCallback(() => {
    console.log('Create category - handled by CategoriesTab component');
  }, []);

  const handleViewCategoryStats = useCallback((categoryId: string) => {
    console.log(`View stats for category: ${categoryId}`);
  }, []);

  return (
    <OptimizedAdminPageLayout title="Categories Management">
      <CategoriesTab
        onCreateCategory={handleCreateCategory}
        onViewStats={handleViewCategoryStats}
      />
    </OptimizedAdminPageLayout>
  );
} 