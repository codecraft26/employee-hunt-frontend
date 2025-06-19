import React, { useState, useEffect } from 'react';
import { Heart, Eye, Calendar, User, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { usePhotoWall, Collage } from '../../hooks/usePhotoWall';

interface CollageViewerProps {
  className?: string;
}

const CollageViewer: React.FC<CollageViewerProps> = ({ className = '' }) => {
  const { getCurrentCollage, likeCollage, loading, error } = usePhotoWall();
  const [collage, setCollage] = useState<Collage | null>(null);
  const [liking, setLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCollage();
  }, []);

  const fetchCollage = async () => {
    const currentCollage = await getCurrentCollage();
    setCollage(currentCollage);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCollage();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleLike = async () => {
    if (!collage || liking || hasLiked) return;

    setLiking(true);
    try {
      const result = await likeCollage(collage.id);
      if (result) {
        setCollage(prev => prev ? { ...prev, likeCount: result.likeCount } : null);
        setHasLiked(true);
        // Store in localStorage to prevent multiple likes
        localStorage.setItem(`liked_collage_${collage.id}`, 'true');
      }
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setLiking(false);
    }
  };

  // Check if user has already liked this collage
  useEffect(() => {
    if (collage) {
      const hasLikedBefore = localStorage.getItem(`liked_collage_${collage.id}`) === 'true';
      setHasLiked(hasLikedBefore);
    }
  }, [collage]);

  if (loading && !collage) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading current collage...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!collage && !loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Collage Available</h3>
          <p className="text-gray-500 mb-4">No collage is currently published. Check back soon!</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{collage?.title}</h2>
            {collage?.description && (
              <p className="text-gray-600 mb-3">{collage.description}</p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh collage"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats and Metadata */}
        <div className="flex items-center space-x-6 text-sm text-gray-600 flex-wrap gap-2">
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{collage?.viewCount.toLocaleString()} views</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4" />
            <span>{collage?.likeCount.toLocaleString()} likes</span>
          </div>
          <div className="flex items-center space-x-1">
            <ImageIcon className="h-4 w-4" />
            <span>{collage?.selectedPhotos.length} photos</span>
          </div>
          {collage?.publishedAt && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Published {new Date(collage.publishedAt).toLocaleDateString()}</span>
            </div>
          )}
          {collage?.publishedBy && (
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>by {collage.publishedBy.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Collage Image */}
      {collage?.collageImageUrl && (
        <div className="p-6">
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <img
              src={collage.collageImageUrl}
              alt={collage.title}
              className="w-full h-auto object-contain"
              style={{ maxHeight: '80vh' }}
            />
          </div>
        </div>
      )}

      {/* Like Button */}
      <div className="px-6 pb-6">
        <button
          onClick={handleLike}
          disabled={liking || hasLiked}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
            hasLiked
              ? 'bg-pink-100 text-pink-700 border border-pink-200'
              : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {liking && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />}
          <Heart className={`h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} />
          <span className="font-medium">
            {liking ? 'Liking...' : hasLiked ? 'Already Liked!' : 'Like this Collage'}
          </span>
        </button>
      </div>

      {/* Featured Photos */}
      {collage?.selectedPhotos && collage.selectedPhotos.length > 0 && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Photos in this Collage ({collage.selectedPhotos.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {collage.selectedPhotos.map((photo) => (
              <div key={photo.id} className="group relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || 'Photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 truncate">
                                            {photo.user?.name || 'Unknown User'}
                  </p>
                  {photo.caption && (
                    <p className="text-xs text-gray-500 truncate" title={photo.caption}>
                      {photo.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {collage?.publishedAt && (
            <>
              Published on {new Date(collage.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              {collage.publishedBy && ` by ${collage.publishedBy.name}`}
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default CollageViewer; 