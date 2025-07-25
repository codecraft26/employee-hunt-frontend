'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import OptimizedPageLayout from '../../../../components/shared/OptimizedPageLayout';
import HeroSection from '../../../../components/shared/HeroSection';
import UserQuizTab from '../../../../components/user/UserQuizTab';

export default function UserQuizPage() {
  return (
    <div>
      <HeroSection 
        imageUrl="/dashboard_tiles/take_quiz.jpg"
        title="Quiz Center"
        subtitle="Test your knowledge and earn points"
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <UserQuizTab />
      </div>
    </div>
  );
} 