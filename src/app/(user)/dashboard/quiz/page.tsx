'use client';

import React, { lazy } from 'react';
import { Shield } from 'lucide-react';
import OptimizedPageLayout from '../../../../components/shared/OptimizedPageLayout';

// Lazy load the UserQuizTab component
const UserQuizTab = lazy(() => import('../../../../components/user/UserQuizTab'));

export default function UserQuizPage() {
  return (
    <OptimizedPageLayout
      title="Quiz Center"
      subtitle="Test your knowledge and earn points"
      icon={Shield}
      iconGradient="from-blue-500 to-blue-600"
    >
      <UserQuizTab />
    </OptimizedPageLayout>
  );
} 