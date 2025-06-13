'use client';

import React, { lazy } from 'react';
import { MapPin } from 'lucide-react';
import OptimizedPageLayout from '../../../../components/shared/OptimizedPageLayout';

// Lazy load the UserTreasureHuntTab component
const UserTreasureHuntTab = lazy(() => import('../../../../components/user/UserTreasureHuntTab'));

export default function UserTreasureHuntPage() {
  return (
    <OptimizedPageLayout
      title="Treasure Hunt"
      subtitle="Discover clues and find hidden treasures"
      icon={MapPin}
      iconGradient="from-green-500 to-green-600"
    >
      <UserTreasureHuntTab />
    </OptimizedPageLayout>
  );
} 