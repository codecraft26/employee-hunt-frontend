import React, { useState, useEffect } from 'react';
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

const AllCollagesViewer: React.FC<AllCollagesViewerProps> = ({ className = '' }) => {
  const { getPublishedCollages, likeCollage, loading, error } = usePhotoWall();
  const [collages, setCollages] = useState<Collage[]>([]);
  const [filteredCollages, setFilteredCollages] = useState<Collage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [likingStates, setLikingStates] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState(false);

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
    setCurrentPage(1); // Reset to first page when filtering
  }, [collages, searchTerm]);

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
    if (likingStates[collageId]) return;

    setLikingStates(prev => ({ ...prev, [collageId]: true }));
    try {
      const result = await likeCollage(collageId);
      if (result) {
        setCollages(prev => 
          prev.map(collage => 
            collage.id === collageId 
              ? { ...collage, likeCount: result.likeCount }
              : collage
          )
        );
        // Store in localStorage to prevent multiple likes
        localStorage.setItem(`liked_collage_${collageId}`, 'true');
      }
    } catch (err) {
      // Error is handled by the hook
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

  const handleShare = async (collage: Collage) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
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
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCollages.map((collage) => (
                <div
                  key={collage.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Collage Image */}
                  <div className="aspect-video bg-slate-900 relative group">
                    {collage.collageImageUrl ? (
                      <img
                        src={collage.collageImageUrl}
                        alt={collage.title}
                        className="w-full h-full object-cover"
                      />
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
                        <div className="grid grid-cols-3 gap-1">
                          {collage.selectedPhotos.slice(0, 6).map((photo, index) => (
                            <div
                              key={photo.id}
                              className="aspect-square rounded overflow-hidden relative group"
                            >
                              <img
                                src={photo.imageUrl}
                                alt={photo.caption || `Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {photo.caption && (
                                <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-end">
                                  <p className="text-xs text-white p-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {photo.caption}
                                  </p>
                                </div>
                              )}
                              {index === 5 && (collage.selectedPhotos?.length || 0) > 6 && (
                                <div className="absolute inset-0 bg-opacity-70 flex items-center justify-center">
                                  <span className="text-xs text-white font-medium">
                                    +{(collage.selectedPhotos?.length || 0) - 6} more
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {(collage.selectedPhotos?.length || 0) > 6 && (
                          <p className="text-xs text-slate-400 mt-1">
                            Showing 6 of {collage.selectedPhotos?.length || 0} photos
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
                      onClick={() => handleLike(collage.id)}
                      disabled={likingStates[collage.id]}
                      className="w-full mt-3 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {likingStates[collage.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b border-white" />
                      ) : (
                        <Heart className="h-4 w-4" />
                      )}
                      <span>Like</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {currentCollages.map((collage) => (
                <div
                  key={collage.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0">
                      {collage.collageImageUrl ? (
                        <img
                          src={collage.collageImageUrl}
                          alt={collage.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-slate-600" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {collage.title}
                      </h3>
                      
                      {collage.description && (
                        <p className="text-slate-300 text-sm mb-2">
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
                          <div className="grid grid-cols-3 gap-1">
                            {collage.selectedPhotos.slice(0, 6).map((photo, index) => (
                              <div
                                key={photo.id}
                                className="aspect-square rounded overflow-hidden relative group"
                              >
                                <img
                                  src={photo.imageUrl}
                                  alt={photo.caption || `Photo ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {photo.caption && (
                                  <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-end">
                                    <p className="text-xs text-white p-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      {photo.caption}
                                    </p>
                                  </div>
                                )}
                                {index === 5 && (collage.selectedPhotos?.length || 0) > 6 && (
                                  <div className="absolute inset-0 bg-opacity-70 flex items-center justify-center">
                                    <span className="text-xs text-white font-medium">
                                      +{(collage.selectedPhotos?.length || 0) - 6} more
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {(collage.selectedPhotos?.length || 0) > 6 && (
                            <p className="text-xs text-slate-400 mt-1">
                              Showing 6 of {collage.selectedPhotos?.length || 0} photos
                            </p>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-sm text-slate-400 mb-2">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{collage.viewCount} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{collage.likeCount} likes</span>
                        </div>
                        {collage.selectedPhotos && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{collage.selectedPhotos.length} photos</span>
                          </div>
                        )}
                      </div>

                      {/* Creator and Date */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>by {collage.createdBy.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(collage.publishedAt || collage.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 flex-shrink-0">
                      <button
                        onClick={() => handleLike(collage.id)}
                        disabled={likingStates[collage.id]}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
                      >
                        {likingStates[collage.id] ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />
                        ) : (
                          <Heart className="h-3 w-3" />
                        )}
                        <span>Like</span>
                      </button>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleDownload(collage.collageImageUrl!, collage.title)}
                          className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          title="Download"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleShare(collage)}
                          className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          title="Share"
                        >
                          <Share2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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