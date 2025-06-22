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
      <div className={`relative rounded-xl shadow-sm border overflow-hidden ${className}`} style={{ minHeight: '480px' }}>
        {/* Collage Background: Dashboard Titles Collage */}
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
              className="w-1/3 md:w-1/4 lg:w-1/6 aspect-square object-cover opacity-80 m-1 rounded-lg shadow-lg border-2 border-slate-800"
              style={{
                transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (8 + i * 3)}deg) scale(${0.95 + (i % 3) * 0.03})`,
                zIndex: 1 + i,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80 z-10" />
        </div>
        <div className="relative z-20 flex items-center justify-center py-12 min-h-[320px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-slate-200">Loading current collage...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!collage && !loading) {
    return (
      <div className={`relative rounded-xl shadow-sm border overflow-hidden ${className}`} style={{ minHeight: '480px' }}>
        {/* Collage Background: Dashboard Titles Collage */}
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
              className="w-1/3 md:w-1/4 lg:w-1/6 aspect-square object-cover opacity-80 m-1 rounded-lg shadow-lg border-2 border-slate-800"
              style={{
                transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (8 + i * 3)}deg) scale(${0.95 + (i % 3) * 0.03})`,
                zIndex: 1 + i,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80 z-10" />
        </div>
        <div className="relative z-20 text-center py-12 min-h-[320px] flex flex-col items-center justify-center">
          <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4 border-4 border-slate-700">
            <ImageIcon className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Collage Available</h3>
          <p className="text-slate-300 mb-4">No collage is currently published. Check back soon!</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors disabled:opacity-50"
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
      <div className={`relative rounded-xl shadow-sm border overflow-hidden ${className}`} style={{ minHeight: '480px' }}>
        {/* Collage Background: Dashboard Titles Collage */}
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
              className="w-1/3 md:w-1/4 lg:w-1/6 aspect-square object-cover opacity-80 m-1 rounded-lg shadow-lg border-2 border-slate-800"
              style={{
                transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (8 + i * 3)}deg) scale(${0.95 + (i % 3) * 0.03})`,
                zIndex: 1 + i,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80 z-10" />
        </div>
        <div className="relative z-20 text-center py-12 min-h-[320px] flex flex-col items-center justify-center">
          <div className="w-24 h-24 mx-auto bg-red-900 rounded-full flex items-center justify-center mb-4 border-4 border-red-700">
            <ImageIcon className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-red-200 mb-2">Failed to Load</h3>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl shadow-sm border overflow-hidden ${className}`} style={{ minHeight: '480px' }}>
      {/* Collage Background: Dashboard Titles Collage */}
      <div className="absolute inset-0 z-0 flex flex-wrap items-center justify-center pointer-events-none select-none">
        {/* Collage grid of dashboard_titles images */}
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
            className="w-1/3 md:w-1/4 lg:w-1/6 aspect-square object-cover opacity-80 m-1 rounded-lg shadow-lg border-2 border-slate-800"
            style={{
              transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (8 + i * 3)}deg) scale(${0.95 + (i % 3) * 0.03})`,
              zIndex: 1 + i,
            }}
          />
        ))}
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80 z-10" />
      </div>
      {/* Main Collage Content (above collage bg) */}
      <div className="relative z-20">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{collage?.title}</h2>
              {collage?.description && (
                <p className="text-slate-300 mb-3">{collage.description}</p>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Refresh collage"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stats and Metadata */}
          <div className="flex items-center space-x-6 text-sm text-slate-400 flex-wrap gap-2">
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
            <div className="relative rounded-lg overflow-hidden bg-slate-900/60">
              <img
                src={collage.collageImageUrl}
                alt={collage.title}
                className="w-full h-auto object-contain shadow-2xl border-4 border-slate-800"
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
          <div className="border-t border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Featured Photos
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
      </div>
    </div>
  );
};

export default CollageViewer; 