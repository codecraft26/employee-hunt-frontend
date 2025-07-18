'use client';

import React from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import OptimizedPageLayout from '../../../../components/shared/OptimizedPageLayout';
import HeroSection from '../../../../components/shared/HeroSection';
import UserTreasureHuntTab from '../../../../components/user/UserTreasureHuntTab';
import GamingButton from '../../../../components/shared/GamingButton';

export default function UserTreasureHuntPage() {
  // Add a handler to refresh the page
  const handleFullPageRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div>
      <div className="flex justify-end p-4">
        <GamingButton
          onClick={handleFullPageRefresh}
          variant="secondary"
          icon={RefreshCw}
          iconPosition="left"
        >
          Refresh Page
        </GamingButton>
      </div>
      <HeroSection 
        imageUrl="/dashboard_tiles/treaure_hunt.jpg"
        title="Treasure Hunt"
        subtitle="Discover clues and find hidden treasures"
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <UserTreasureHuntTab />
      </div>
    </div>
  );
} 