'use client';

import React, { lazy } from 'react';
import { Users } from 'lucide-react';
import { useAppSelector } from '../../../../hooks/redux';
import OptimizedPageLayout from '../../../../components/shared/OptimizedPageLayout';

// Lazy load the UserTeamTab component
const UserTeamTab = lazy(() => import('../../../../components/user/UserTeamTab'));

export default function UserTeamPage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <OptimizedPageLayout
      title="My Team"
      subtitle="Connect with your team members"
      icon={Users}
      iconGradient="from-indigo-500 to-indigo-600"
    >
      {user && <UserTeamTab user={user} />}
    </OptimizedPageLayout>
  );
} 