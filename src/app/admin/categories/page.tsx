'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import OptimizedAdminPageLayout from '../../../components/shared/OptimizedAdminPageLayout';
import CategoriesTab from '../../../components/tabs/CategoriesTab';

export default function AdminCategoriesPage() {
  const handleCreateCategory = () => {
    // TODO: Implement create category functionality
  };

  const handleViewCategoryStats = (categoryId: string) => {
    // TODO: Implement view category stats functionality
  };

  return (
    <OptimizedAdminPageLayout title="Categories Management">
      <CategoriesTab
        onCreateCategory={handleCreateCategory}
        onViewStats={handleViewCategoryStats}
      />
    </OptimizedAdminPageLayout>
  );
} 