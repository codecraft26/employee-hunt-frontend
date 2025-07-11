import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Eye, 
  Calendar, 
  User, 
  Image as ImageIcon, 
  RefreshCw, 
  Search,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Users,
  MessageSquare,
  Download,
  Share2,
  Star
} from 'lucide-react';
import { usePhotoWall, Collage } from '../../hooks/usePhotoWall';

interface AllCollagesViewerProps {
  className?: string;
}

// Fallback types if not defined
// type Collage = any;
// type Photo = any;

type CollageType = any;
type Photo = any;

// Add a simple formatDate function if not present
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

interface AllCollageCardProps {
  collage: CollageType;
  isLiked: boolean;
  likingState: boolean;
  handleLike: (collageId: string) => void;
}

function AllCollageCard({ collage, isLiked, likingState, handleLike }: AllCollageCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = `viewed_collage_${collage.id}`;
    if (typeof window === 'undefined' || localStorage.getItem(key) === 'true') {
      console.log(`🔄 Collage ${collage.id} already viewed or SSR, skipping view tracking`);
      return;
    }

    console.log(`👁️ Setting up view tracking for collage ${collage.id}`);

    let hasTriggered = false;

    const incrementViews = () => {
      if (hasTriggered) return;
      
      console.log(`✅ Collage ${collage.id} is now visible, incrementing views...`);
      hasTriggered = true;
      
      fetch(`https://backend.banndhann.com/api/photo-wall/collages/${collage.id}/increment-views`, { 
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => {
        if (response.ok) {
          console.log(`✅ View count incremented successfully for collage ${collage.id}`);
          localStorage.setItem(key, 'true');
        } else {
          console.error(`❌ Failed to increment view count for collage ${collage.id}:`, response.status, response.statusText);
        }
      })
      .catch(error => {
        console.error(`❌ Error incrementing view count for collage ${collage.id}:`, error);
      });
    };

    // Use Intersection Observer
    if ('IntersectionObserver' in window) {
      console.log(`🔧 Using Intersection Observer for collage ${collage.id}`);
      
      const observer = new window.IntersectionObserver(
        (entries) => {
          console.log(`🔍 Observer callback triggered for collage ${collage.id}:`, {
            isIntersecting: entries[0].isIntersecting,
            intersectionRatio: entries[0].intersectionRatio
          });
          
          if (entries[0].isIntersecting) {
            incrementViews();
            observer.disconnect();
          }
        },
        { 
          threshold: 0.1,
          rootMargin: '50px'
        }
      );

      if (cardRef.current) {
        observer.observe(cardRef.current);
        console.log(`👀 Observer attached to collage ${collage.id}`);
      } else {
        console.warn(`⚠️ Card ref not available for collage ${collage.id}`);
      }

      return () => observer.disconnect();
    }
  }, [collage.id]);

  return (
    <div
      ref={cardRef}
      className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Collage Image */}
      <div className="relative group">
        {collage.collageImageUrl ? (
          <>
            <img
              src={collage.collageImageUrl}
              alt={collage.title}
              className="w-full h-full object-cover"
            />
            {/* Collage Download Icon Button */}
            <a
              href={collage.collageImageUrl}
              download={`collage_${collage.title.replace(/[^a-zA-Z0-9-_]/g, '_') || 'collage'}.jpg`}
              className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors z-10 shadow pointer-events-auto"
              title="Download collage image"
              target="_blank" rel="noopener noreferrer"
            >
              <Download className="h-4 w-4" />
            </a>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-slate-600" />
          </div>
        )}
      </div>

      {/* Collage Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {collage.title}
        </h3>
        
        {collage.description && (
          <p className="text-slate-300 text-sm mb-3 line-clamp-2">
            {collage.description}
          </p>
        )}

        {/* Selected Photos Section */}
        {collage.selectedPhotos && collage.selectedPhotos.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
              <Users className="h-3 w-3 mr-1" />
              Photos in this collage ({collage.selectedPhotos.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {collage.selectedPhotos.slice(0, 6).map((photo: Photo, index: number) => (
                <div
                  key={photo.id}
                  className="flex flex-col items-center"
                >
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Individual Photo Download Button */}
                    <a
                      href={photo.imageUrl}
                      download={`photo_${index + 1}.jpg`}
                      className="absolute bottom-1 right-1 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors z-10 shadow pointer-events-auto"
                      title="Download photo"
                      target="_blank" rel="noopener noreferrer"
                    >
                      <Download className="h-3 w-3" />
                    </a>
                  </div>
                  {photo.caption && (
                    <p className="text-xs text-center text-slate-300 mt-1 w-28 sm:w-32 break-words">
                      {photo.caption}
                    </p>
                  )}
                  {photo.user?.name && (
                    <p className="text-xs text-center text-slate-400 mt-0.5 w-28 sm:w-32 break-words">
                      by {photo.user.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {collage.selectedPhotos.length > 6 && (
              <p className="text-xs text-slate-400 mt-1">
                Showing 6 of {collage.selectedPhotos.length} photos
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{collage.viewCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{collage.likeCount}</span>
            </div>
            {collage.selectedPhotos && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{collage.selectedPhotos.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Creator and Date */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{collage.createdBy.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(collage.publishedAt || collage.createdAt)}</span>
          </div>
        </div>

        {/* Like Button */}
        <button
          onClick={() => {
            console.log('Like button clicked for collage:', collage.id);
            handleLike(collage.id);
          }}
          disabled={isLiked === true || likingState === true}
          className={`w-full mt-3 px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 transform
            ${isLiked 
              ? 'bg-purple-700 text-white scale-105 shadow-lg' 
              : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105'
            }
            ${(isLiked === true || likingState === true) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
        >
          <Heart 
            className={`h-4 w-4 transition-all duration-200 ${
              isLiked 
                ? 'fill-current text-white animate-pulse' 
                : 'hover:scale-110'
            }`} 
            fill={isLiked ? 'currentColor' : 'none'} 
          />
          <span className="font-medium">
            {isLiked === true ? 'Liked' : (likingState === true ? 'Liking...' : 'Like')}
          </span>
        </button>
      </div>
    </div>
  );
}

const AllCollagesViewer: React.FC<AllCollagesViewerProps> = ({ className = '' }) => {
  const { getPublishedCollages, likeCollage, getLikedCollageIds, loading, error } = usePhotoWall();
  const [collages, setCollages] = useState<CollageType[]>([]);
  const [filteredCollages, setFilteredCollages] = useState<CollageType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [likingStates, setLikingStates] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [likedCollages, setLikedCollages] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchCollages();
  }, []);

  useEffect(() => {
    // Filter collages based on search term
    const filtered = collages.filter(collage =>
      collage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collage.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collage.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCollages(filtered);
  }, [collages, searchTerm]);

  // Separate effect to reset page only when search term changes
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm]);

  useEffect(() => {
    // Fetch liked collage IDs from API and update likedCollages state
    const fetchLikedCollages = async () => {
      try {
        const likedIds = await getLikedCollageIds();
        const liked: { [key: string]: boolean } = {};
        likedIds.forEach((id) => {
          liked[id] = true;
        });
        setLikedCollages(liked);
      } catch (err) {
        setLikedCollages({});
      }
    };
    fetchLikedCollages();
  }, [collages, getLikedCollageIds]);

  const fetchCollages = async () => {
    const publishedCollages = await getPublishedCollages();
    setCollages(publishedCollages);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCollages();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleLike = async (collageId: string) => {
    console.log('Like button clicked for collage:', collageId);
    
    // Check both loading states and liked state more explicitly
    if (likingStates[collageId] === true || likedCollages[collageId] === true) {
      console.log('Already liking or already liked, ignoring click');
      return;
    }

    // Immediately update both UI states together to prevent race conditions
    setLikingStates(prev => ({ ...prev, [collageId]: true }));
    setLikedCollages(prev => ({ ...prev, [collageId]: true }));
    setCollages(prev => 
      prev.map(collage => 
        collage.id === collageId 
          ? { ...collage, likeCount: collage.likeCount + 1 }
          : collage
      )
    );
    localStorage.setItem(`liked_collage_${collageId}`, 'true');
    
    // Make API call in background
    try {
      console.log('Calling likeCollage API...');
      const result = await likeCollage(collageId);
      console.log('Like result:', result);
      
      if (result && typeof result === 'object' && result.likeCount !== undefined) {
        console.log('Updating collage like count to:', result.likeCount);
        // Update with actual server response
        setCollages(prev => 
          prev.map(collage => 
            collage.id === collageId 
              ? { ...collage, likeCount: result.likeCount }
              : collage
          )
        );
      } else if (result === 'already-liked') {
        console.log('Collage already liked');
        // Keep the optimistic update
      } else {
        console.log('Unexpected result format:', result);
        // Revert optimistic update on unexpected result
        setLikedCollages(prev => ({ ...prev, [collageId]: false }));
        setCollages(prev => 
          prev.map(collage => 
            collage.id === collageId 
              ? { ...collage, likeCount: Math.max(0, collage.likeCount - 1) }
              : collage
          )
        );
        localStorage.removeItem(`liked_collage_${collageId}`);
      }
    } catch (err) {
      console.error('Error in handleLike:', err);
      // Revert optimistic update on error
      setLikedCollages(prev => ({ ...prev, [collageId]: false }));
      setCollages(prev => 
        prev.map(collage => 
          collage.id === collageId 
            ? { ...collage, likeCount: Math.max(0, collage.likeCount - 1) }
            : collage
        )
      );
      localStorage.removeItem(`liked_collage_${collageId}`);
    } finally {
      setLikingStates(prev => ({ ...prev, [collageId]: false }));
    }
  };

  const handleDownload = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const handleShare = async (collage: CollageType) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: collage.title,
          text: collage.description || 'Check out this amazing collage!',
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `${collage.title}\n${collage.description || 'Check out this amazing collage!'}\n${window.location.href}`;
      try {
        await navigator.clipboard.writeText(shareText);
        // You could show a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredCollages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCollages = filteredCollages.slice(startIndex, endIndex);

  if (loading && collages.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-slate-200">Loading collages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && collages.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">All Collages</h2>
          <p className="text-slate-300 mt-1">
            {collages.length} published collage{collages.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search collages by title, description, or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Results */}
      {filteredCollages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4 border-4 border-slate-700">
            <ImageIcon className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm ? 'No collages found' : 'No collages available'}
          </h3>
          <p className="text-slate-300">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'No collages have been published yet. Check back soon!'
            }
          </p>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {(
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCollages.map((collage) => (
                <AllCollageCard
                  key={collage.id}
                  collage={collage}
                  isLiked={likedCollages[collage.id] === true}
                  likingState={likingStates[collage.id] === true}
                  handleLike={handleLike}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCollages.length)} of {filteredCollages.length} collages
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <span className="text-sm text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllCollagesViewer; 