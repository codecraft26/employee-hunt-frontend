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
      customBackground={
        <>
          <div className="absolute inset-0 z-0 flex flex-wrap items-center justify-center pointer-events-none select-none">
            {[
              '/dashboard_tiles/take_quiz.jpg',
              '/dashboard_tiles/treaure_hunt.jpg',
              '/dashboard_tiles/polls.jpg',
              '/dashboard_tiles/photo_wall.jpg',
              '/dashboard_tiles/activities.jpg',
              '/dashboard_tiles/my_team.jpg',
            ].map((src, i) => (
              <img
                key={src}
                src={src}
                alt="collage-tile"
                className="w-1/3 md:w-1/4 lg:w-1/6 aspect-square object-cover opacity-60 m-1 rounded-lg shadow-lg border-2 border-slate-800"
                style={{
                  transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (8 + i * 3)}deg) scale(${0.95 + (i % 3) * 0.03})`,
                  zIndex: 1 + i,
                }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-900/90 z-10" />
          </div>
        </>
      }
    >
      <UserPhotoWallTab onUploadSuccess={handleUploadSuccess} />
    </OptimizedPageLayout>
  );
} 