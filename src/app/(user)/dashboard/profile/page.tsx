'use client';

import React, { lazy } from 'react';
import { User } from 'lucide-react';
import { useAppSelector } from '../../../../hooks/redux';
import OptimizedPageLayout from '../../../../components/shared/OptimizedPageLayout';

// Lazy load the UserProfileTab component
const UserProfileTab = lazy(() => import('../../../../components/user/UserProfileTab'));

export default function UserProfilePage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <OptimizedPageLayout
      title="My Profile"
      subtitle="Manage your account and preferences"
      icon={User}
      iconGradient="from-pink-500 to-pink-600"
    >
      {user && <UserProfileTab user={user} />}
    </OptimizedPageLayout>
  );
} 