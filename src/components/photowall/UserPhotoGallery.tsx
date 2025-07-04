import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Clock, CheckCircle, XCircle, RefreshCw, Filter, AlertCircle, Download, Lock } from 'lucide-react';
import { usePhotoWall, Photo } from '../../hooks/usePhotoWall';

interface UserPhotoGalleryProps {
  className?: string;
}

const UserPhotoGallery: React.FC<UserPhotoGalleryProps> = ({ className = '' }) => {
  const { getUserPhotos, loading, error } = usePhotoWall();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [filter]);

  const fetchPhotos = async () => {
    const status = filter === 'ALL' ? undefined : filter;
    const userPhotos = await getUserPhotos(status);
    setPhotos(userPhotos);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPhotos();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Function to download an image
  const downloadImage = async (imageUrl: string, filename?: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `my-photo-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-100 border-green-200';
      case 'REJECTED': return 'text-red-600 bg-red-100 border-red-200';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'PENDING': return 'Pending Review';
      default: return status;
    }
  };

  const filteredPhotos = photos;
  const totalPhotos = photos.length;
  const approvedPhotos = photos.filter(p => p.status === 'APPROVED').length;
  const pendingPhotos = photos.filter(p => p.status === 'PENDING').length;
  const rejectedPhotos = photos.filter(p => p.status === 'REJECTED').length;
  const inCollagePhotos = photos.filter(p => p.isInCollage).length;

  if (loading && photos.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your photos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">My Photos</h2>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh photos"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalPhotos}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingPhotos}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{approvedPhotos}</div>
            <div className="text-xs text-gray-500">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{rejectedPhotos}</div>
            <div className="text-xs text-gray-500">Rejected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{inCollagePhotos}</div>
            <div className="text-xs text-gray-500">In Collages</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                filter === status
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {status === 'ALL' ? 'All Photos' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      <div className="p-6">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {totalPhotos === 0 ? 'No photos uploaded' : 'No photos match your filter'}
            </h3>
            <p className="text-gray-500 mb-4">
              {totalPhotos === 0 
                ? 'Upload some photos to get started!'
                : 'Try adjusting your filter to see more photos'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Photo Image */}
                <div className="aspect-square bg-gray-100 relative">
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || 'Photo'}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Status Badge */}
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(photo.status)}`}>
                    {getStatusIcon(photo.status)}
                    <span>{getStatusText(photo.status)}</span>
                  </div>

                  {/* Private Badge */}
                  {photo.isPrivate && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-medium border border-purple-700 flex items-center space-x-1">
                      <Lock className="h-3 w-3" />
                      <span>Private</span>
                    </div>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={() => downloadImage(photo.imageUrl, `my-photo-${Date.now()}.jpg`)}
                    className="absolute top-2 right-14 px-2 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors z-20 shadow-lg"
                    title="Download photo"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  {/* In Collage Badge */}
                  {photo.isInCollage && (
                    <div className="absolute top-2 right-14 px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-medium">
                      In Collage
                    </div>
                  )}
                </div>

                {/* Photo Details */}
                <div className="p-4">
                  {/* Caption */}
                  {photo.caption && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2" title={photo.caption}>
                      "{photo.caption}"
                    </p>
                  )}

                  {/* Admin Feedback */}
                  {photo.adminFeedback && (
                    <div className={`p-3 rounded-lg mb-3 border-l-4 ${
                      photo.status === 'APPROVED' 
                        ? 'bg-green-50 border-green-400' 
                        : 'bg-red-50 border-red-400'
                    }`}>
                      <p className="text-xs font-medium text-gray-700 mb-1">Admin Feedback:</p>
                      <p className="text-xs text-gray-600">{photo.adminFeedback}</p>
                    </div>
                  )}

                  {/* Upload Date */}
                  <div className="text-xs text-gray-500 flex items-center justify-between">
                    <span>Uploaded: {new Date(photo.createdAt).toLocaleDateString()}</span>
                    {photo.updatedAt !== photo.createdAt && (
                      <span>Updated: {new Date(photo.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Text */}
      {totalPhotos === 0 && (
        <div className="p-6 bg-blue-50 border-t border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Photo Upload Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Upload high-quality images for the best collage results</li>
            <li>• Add meaningful captions to your photos</li>
            <li>• Wait for admin approval before photos can be used in collages</li>
            <li>• Approved photos may be featured in team photo walls</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserPhotoGallery; 