'use client';

import React, { lazy } from 'react';
import OptimizedAdminPageLayout from '../../../components/shared/OptimizedAdminPageLayout';

// Lazy load the AdminApprovalsTab component
const AdminApprovalsTab = lazy(() => import('../../../components/tabs/AdminApprovalsTab'));

export default function ApproveUserPage() {
  // Handler functions for user approval actions
  const handleApproveUser = (userName: string, userId: string) => {
    // Handled by AdminApprovalsTab component
  };

  const handleRejectUser = (userName: string, userId: string) => {
    // Handled by AdminApprovalsTab component
  };

  const handleBulkApprove = (userIds: string[]) => {
    // Handled by AdminApprovalsTab component
  };

  const handleRefreshUsers = () => {
    // Handled by AdminApprovalsTab component
  };

  const handleViewUserDetails = (userId: string) => {
    // Handled by AdminApprovalsTab component
  };

  return (
    <OptimizedAdminPageLayout title="User Approvals">
      <AdminApprovalsTab />
    </OptimizedAdminPageLayout>
  );
}