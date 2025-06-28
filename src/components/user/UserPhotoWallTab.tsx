import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Upload, Images, Grid } from 'lucide-react';
import CollageViewer from '../photowall/CollageViewer';
import PhotoUpload from '../photowall/PhotoUpload';
import UserPhotoGallery from '../photowall/UserPhotoGallery';
import AllCollagesViewer from '../photowall/AllCollagesViewer';

interface UserPhotoWallTabProps {
  onUploadSuccess?: () => void;
}

const UserPhotoWallTab: React.FC<UserPhotoWallTabProps> = ({ onUploadSuccess }) => {
  const [activeView, setActiveView] = useState<'all-collages' | 'upload' | 'gallery' | 'collage'>('all-collages');

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
          <h2 className="text-2xl font-bold text-white">Photo Wall</h2>
          <p className="text-slate-300 mt-1">View collages, upload photos, and manage your gallery</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700">
        <nav className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveView('all-collages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === 'all-collages'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Grid className="h-4 w-4 text-slate-300" />
              <span>All Collages</span>
            </div>
          </button>

          <button
            onClick={() => setActiveView('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === 'upload'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Upload className="h-4 w-4 text-slate-300" />
              <span>Upload Photo</span>
            </div>
          </button>

          <button
            onClick={() => setActiveView('gallery')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === 'gallery'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Images className="h-4 w-4 text-slate-300" />
              <span>My Photos</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[400px] sm:min-h-[600px] max-h-[80vh] overflow-y-auto">
        {activeView === 'all-collages' && <AllCollagesViewer />}
        {activeView === 'upload' && <PhotoUpload onUploadSuccess={handleUploadSuccess} />}
        {activeView === 'gallery' && <UserPhotoGallery />}
      </div>

      {/* Quick Tips */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-purple-300 mb-2">Photo Wall Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-slate-300">
          <div>
            <h4 className="font-medium mb-1 text-white">All Collages</h4>
            <p>Browse through all published collages and discover amazing team moments</p>
          </div>
          <div>
            <h4 className="font-medium mb-1 text-white">Upload Photos</h4>
            <p>Share your photos with the team. They'll be reviewed before approval</p>
          </div>
          <div>
            <h4 className="font-medium mb-1 text-white">My Gallery</h4>
            <p>Track your uploaded photos and see which ones are featured in collages</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPhotoWallTab; 