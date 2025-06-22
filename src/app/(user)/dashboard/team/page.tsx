'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { useAppSelector } from '../../../../hooks/redux';
import OptimizedPageLayout from '../../../../components/shared/OptimizedPageLayout';
import UserTeamTab from '../../../../components/user/UserTeamTab';

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