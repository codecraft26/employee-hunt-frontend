import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Upload, Images } from 'lucide-react';
import CollageViewer from '../photowall/CollageViewer';
import PhotoUpload from '../photowall/PhotoUpload';
import UserPhotoGallery from '../photowall/UserPhotoGallery';

interface UserPhotoWallTabProps {
  onUploadSuccess?: () => void;
}

const UserPhotoWallTab: React.FC<UserPhotoWallTabProps> = ({ onUploadSuccess }) => {
  const [activeView, setActiveView] = useState<'collage' | 'upload' | 'gallery'>('collage');

  const handleUploadSuccess = () => {
    onUploadSuccess?.();
    // Switch to gallery view after successful upload
    setActiveView('gallery');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Photo Wall</h2>
          <p className="text-gray-600 mt-1">View collages, upload photos, and manage your gallery</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveView('collage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === 'collage'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4" />
              <span>Current Collage</span>
            </div>
          </button>

          <button
            onClick={() => setActiveView('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === 'upload'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload Photo</span>
            </div>
          </button>

          <button
            onClick={() => setActiveView('gallery')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === 'gallery'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Images className="h-4 w-4" />
              <span>My Photos</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {activeView === 'collage' && <CollageViewer />}
        {activeView === 'upload' && <PhotoUpload onUploadSuccess={handleUploadSuccess} />}
        {activeView === 'gallery' && <UserPhotoGallery />}
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Photo Wall Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-1">Current Collage</h4>
            <p>View and like the latest team photo collage created by admins</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Upload Photos</h4>
            <p>Share your photos with the team. They'll be reviewed before approval</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">My Gallery</h4>
            <p>Track your uploaded photos and see which ones are featured in collages</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPhotoWallTab; 