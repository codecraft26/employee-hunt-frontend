'use client';

import React, { lazy } from 'react';
import { Zap } from 'lucide-react';
import OptimizedPageLayout from '../../../../components/shared/OptimizedPageLayout';

// Lazy load the UserActivitiesTab component
const UserActivitiesTab = lazy(() => import('../../../../components/user/UserActivitiesTab'));

export default function UserActivitiesPage() {
  return (
    <OptimizedPageLayout
      title="My Activities"
      subtitle="Track your progress and achievements"
      icon={Zap}
      iconGradient="from-orange-500 to-orange-600"
    >
      <UserActivitiesTab />
    </OptimizedPageLayout>
  );
} 