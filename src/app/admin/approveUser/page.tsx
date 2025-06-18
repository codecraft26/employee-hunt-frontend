'use client';

import React, { lazy, useCallback } from 'react';
import OptimizedAdminPageLayout from '../../../components/shared/OptimizedAdminPageLayout';

// Lazy load the AdminApprovalsTab component
const AdminApprovalsTab = lazy(() => import('../../../components/tabs/AdminApprovalsTab'));

export default function AdminApprovalsPage() {
  // Memoized approval handlers
  const handleApproveUser = useCallback((userId: string, userName: string) => {
    console.log(`Approve user ${userName} with ID: ${userId} - handled by AdminApprovalsTab component`);
  }, []);

  const handleRejectUser = useCallback((userId: string, userName: string) => {
    console.log(`Reject user ${userName} with ID: ${userId} - handled by AdminApprovalsTab component`);
  }, []);

  const handleBulkApprove = useCallback((userIds: string[]) => {
    console.log(`Bulk approve ${userIds.length} users - handled by AdminApprovalsTab component`);
  }, []);

  const handleRefreshPendingUsers = useCallback(() => {
    console.log('Refresh pending users - handled by AdminApprovalsTab component');
  }, []);

  const handleViewUserDetails = useCallback((userId: string) => {
    console.log(`View details for user: ${userId}`);
  }, []);

  return (
    <OptimizedAdminPageLayout title="User Approvals Management">
      <AdminApprovalsTab
        onApproveUser={handleApproveUser}
        onRejectUser={handleRejectUser}
        onBulkApprove={handleBulkApprove}
        onRefresh={handleRefreshPendingUsers}
        onViewUserDetails={handleViewUserDetails}
      />
    </OptimizedAdminPageLayout>
  );
}