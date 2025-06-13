'use client';

import React, { lazy } from 'react';
import { Vote } from 'lucide-react';
import OptimizedPageLayout from '../../../../components/shared/OptimizedPageLayout';

// Lazy load the UserPollsTab component
const UserPollsTab = lazy(() => import('../../../../components/user/UserPollsTab'));

export default function UserPollsPage() {
  return (
    <OptimizedPageLayout
      title="Polls & Voting"
      subtitle="Participate in team polls and voting"
      icon={Vote}
      iconGradient="from-purple-500 to-purple-600"
    >
      <UserPollsTab />
    </OptimizedPageLayout>
  );
} 