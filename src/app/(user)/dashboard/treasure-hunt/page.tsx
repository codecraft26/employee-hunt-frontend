'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import OptimizedPageLayout from '../../../../components/shared/OptimizedPageLayout';
import HeroSection from '../../../../components/shared/HeroSection';
import UserTreasureHuntTab from '../../../../components/user/UserTreasureHuntTab';

export default function UserTreasureHuntPage() {
  return (
    <div>
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