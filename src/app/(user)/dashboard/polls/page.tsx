'use client';

import React from 'react';
import { Vote } from 'lucide-react';
import OptimizedPageLayout from '../../../../components/shared/OptimizedPageLayout';
import HeroSection from '../../../../components/shared/HeroSection';
import UserPollsTab from '../../../../components/user/UserPollsTab';

export default function UserPollsPage() {
  return (
    <div>
      <HeroSection 
        imageUrl="/dashboard_tiles/polls.jpg"
        title="Polls & Voting"
        subtitle="Participate in team polls and voting"
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <UserPollsTab />
      </div>
    </div>
  );
} 