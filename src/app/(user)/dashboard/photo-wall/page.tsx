'use client';

import React from 'react';
import { Camera } from 'lucide-react';
import OptimizedPageLayout from '../../../../components/shared/OptimizedPageLayout';
import UserPhotoWallTab from '../../../../components/user/UserPhotoWallTab';

export default function PhotoWallPage() {
  const handleUploadSuccess = () => {
    // Could refresh data or show a notification
  };

  return (
    <OptimizedPageLayout 
      title="Photo Wall" 
      subtitle="Upload and view team photos in beautiful collages"
      icon={Camera}
      iconGradient="from-pink-500 to-violet-500"
    >
      <UserPhotoWallTab onUploadSuccess={handleUploadSuccess} />
    </OptimizedPageLayout>
  );
} 