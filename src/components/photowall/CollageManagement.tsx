import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Eye, 
  Edit, 
  Trash2, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Filter,
  Plus,
  Download,
  Share2,
  Calendar,
  Users,
  Image as ImageIcon,
  AlertCircle,
  Settings,
  Archive,
  Globe
} from 'lucide-react';
import { useCollageManagement, Collage } from '../../hooks/usePhotoWall';
import { useToast } from '../shared/ToastContainer';

interface CollageManagementProps {
  onCollageUpdated?: () => void;
}

const CollageManagement: React.FC<CollageManagementProps> = ({ onCollageUpdated }) => {
  const {
    collageLoading,
    collageError,
    clearCollageError,
    getAllCollages,
    getGeneratedCollages,
    getCollageDetails,
    createCollage,
    generateCollage,
    uploadCollageImage,
    publishCollage,
    deleteCollage,
  } = useCollageManagement();

  const { showSuccess, showError } = useToast();

  const [collages, setCollages] = useState<Collage[]>([]);
  const [filter, setFilter] = useState<'all' | 'generated' | 'manual'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [selectedCollage, setSelectedCollage] = useState<Collage | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processingCollageId, setProcessingCollageId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCollages();
  }, [filter]);

  useEffect(() => {
    if (collageError) {
      showError('Error', collageError);
      clearCollageError();
    }
  }, [collageError, showError, clearCollageError]);

  const fetchCollages = async () => {
    setRefreshing(true);
    try {
      let fetchedCollages: Collage[] = [];
      
      if (filter === 'generated') {
        fetchedCollages = await getGeneratedCollages();
      } else {
        fetchedCollages = await getAllCollages();
      }
      
      setCollages(fetchedCollages);
    } catch (error) {
      console.error('Failed to fetch collages:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await fetchCollages();
  };

  const handlePublish = async (collageId: string) => {
    setProcessingCollageId(collageId);
    try {
      const success = await publishCollage(collageId);
      if (success) {
        showSuccess('Success', 'Collage published successfully!');
        await fetchCollages();
        onCollageUpdated?.();
      }
    } catch (error) {
      console.error('Failed to publish collage:', error);
    } finally {
      setProcessingCollageId(null);
    }
  };

  const handleDelete = async (collageId: string) => {
    const collage = collages.find(c => c.id === collageId);
    if (!collage) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${collage.title}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      setProcessingCollageId(collageId);
      try {
        const success = await deleteCollage(collageId);
        if (success) {
          showSuccess('Success', 'Collage deleted successfully!');
          await fetchCollages();
          onCollageUpdated?.();
        }
      } catch (error) {
        console.error('Failed to delete collage:', error);
      } finally {
        setProcessingCollageId(null);
      }
    }
  };

  const handleViewDetails = async (collageId: string) => {
    try {
      const details = await getCollageDetails(collageId);
      if (details) {
        setSelectedCollage(details);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch collage details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'text-green-600 bg-green-100 border-green-200';
      case 'DRAFT': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'ARCHIVED': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return <CheckCircle className="h-4 w-4" />;
      case 'DRAFT': return <Clock className="h-4 w-4" />;
      case 'ARCHIVED': return <Archive className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredCollages = collages.filter(collage => {
    if (statusFilter !== 'all' && collage.status.toLowerCase() !== statusFilter) {
      return false;
    }
    return true;
  });

  const totalCollages = collages.length;
  const publishedCollages = collages.filter(c => c.status === 'PUBLISHED').length;
  const draftCollages = collages.filter(c => c.status === 'DRAFT').length;
  const archivedCollages = collages.filter(c => c.status === 'ARCHIVED').length;
  const generatedCollages = collages.filter(c => c.isGenerated).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Collage Management</h2>
          <p className="text-gray-600 mt-1">Manage and control all photo collages</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh collages"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">{totalCollages}</div>
          <div className="text-sm text-gray-500">Total Collages</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{publishedCollages}</div>
          <div className="text-sm text-gray-500">Published</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{draftCollages}</div>
          <div className="text-sm text-gray-500">Draft</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-gray-600">{archivedCollages}</div>
          <div className="text-sm text-gray-500">Archived</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{generatedCollages}</div>
          <div className="text-sm text-gray-500">Generated</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 flex-wrap gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        
        {/* Type Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Type:</span>
          {['all', 'generated', 'manual'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                filter === type
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Status:</span>
          {['all', 'draft', 'published', 'archived'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                statusFilter === status
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Collages Grid */}
      {collageLoading && collages.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading collages...</p>
          </div>
        </div>
      ) : filteredCollages.length === 0 ? (
        <div className="text-center py-12">
          <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {totalCollages === 0 ? 'No collages created' : 'No collages match your filter'}
          </h3>
          <p className="text-gray-500">
            {totalCollages === 0 
              ? 'Create your first collage to get started'
              : 'Try adjusting your filters to see more collages'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollages.map((collage) => (
            <div
              key={collage.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Collage Image */}
              <div className="aspect-video bg-gray-100 relative">
                {collage.collageImageUrl ? (
                  <img
                    src={collage.collageImageUrl}
                    alt={collage.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(collage.status)}`}>
                  {getStatusIcon(collage.status)}
                  <span>{collage.status}</span>
                </div>

                {/* Generated Badge */}
                {collage.isGenerated && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-medium">
                    Generated
                  </div>
                )}
              </div>

              {/* Collage Details */}
              <div className="p-4">
                {/* Title */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1" title={collage.title}>
                  {collage.title}
                </h3>

                {/* Description */}
                {collage.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={collage.description}>
                    {collage.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{(collage.selectedPhotos || []).length} photos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{collage.viewCount || 0} views</span>
                  </div>
                </div>

                {/* Created Info */}
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                  <Calendar className="h-3 w-3" />
                  <span>Created: {new Date(collage.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(collage.id)}
                    className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Details</span>
                  </button>
                  
                  {collage.status === 'DRAFT' && (
                    <button
                      onClick={() => handlePublish(collage.id)}
                      disabled={processingCollageId === collage.id}
                      className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                    >
                      {processingCollageId === collage.id && <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />}
                      <CheckCircle className="h-3 w-3" />
                      <span>Publish</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(collage.id)}
                    disabled={processingCollageId === collage.id}
                    className="flex-1 px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                  >
                    {processingCollageId === collage.id && <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600" />}
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collage Details Modal */}
      {showDetailsModal && selectedCollage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Collage Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Collage Image */}
              {selectedCollage.collageImageUrl && (
                <div className="text-center">
                  <img
                    src={selectedCollage.collageImageUrl}
                    alt={selectedCollage.title}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Collage Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Title</h4>
                  <p className="text-gray-600">{selectedCollage.title}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedCollage.status)}`}>
                    {getStatusIcon(selectedCollage.status)}
                    <span>{selectedCollage.status}</span>
                  </div>
                </div>

                {selectedCollage.description && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedCollage.description}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Created By</h4>
                  <p className="text-gray-600">{selectedCollage.createdBy.name}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Created Date</h4>
                  <p className="text-gray-600">{new Date(selectedCollage.createdAt).toLocaleString()}</p>
                </div>

                {selectedCollage.publishedBy && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Published By</h4>
                    <p className="text-gray-600">{selectedCollage.publishedBy.name}</p>
                  </div>
                )}

                {selectedCollage.publishedAt && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Published Date</h4>
                    <p className="text-gray-600">{new Date(selectedCollage.publishedAt).toLocaleString()}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Views</h4>
                  <p className="text-gray-600">{selectedCollage.viewCount}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Likes</h4>
                  <p className="text-gray-600">{selectedCollage.likeCount || 0}</p>
                </div>
              </div>

              {/* Photos in Collage */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Photos in Collage ({(selectedCollage.selectedPhotos || []).length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(selectedCollage.selectedPhotos || []).map((photo, index) => (
                    <div key={photo.id} className="relative">
                      <img
                        src={photo.imageUrl}
                        alt={photo.caption || `Photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                        {photo.user?.name || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollageManagement; 