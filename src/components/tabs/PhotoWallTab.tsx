import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Trash2, 
  RefreshCw,
  Filter,
  Users,
  Clock,
  Palette,
  Eye,
  AlertCircle,
  Settings
} from 'lucide-react';
import { usePhotoWall, Photo } from '../../hooks/usePhotoWall';
import AdminCollageCreator from '../photowall/AdminCollageCreator';
import CollageManagement from '../photowall/CollageManagement';

interface PhotoWallTabProps {
  className?: string;
}

const PhotoWallTab: React.FC<PhotoWallTabProps> = ({ className = '' }) => {
  const {
    getAllPhotos,
    approvePhoto,
    rejectPhoto,
    deletePhoto,
    loading,
    error,
    clearError
  } = usePhotoWall();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<'photos' | 'collage' | 'collage-management'>('photos');
  const [processingPhotoId, setProcessingPhotoId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedPhotoForFeedback, setSelectedPhotoForFeedback] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, [filter]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchPhotos = async () => {
    const status = filter === 'ALL' ? undefined : filter;
    const allPhotos = await getAllPhotos(status);
    setPhotos(allPhotos);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPhotos();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleApprove = async (photoId: string, feedback?: string) => {
    setProcessingPhotoId(photoId);
    try {
      const success = await approvePhoto(photoId, feedback);
      if (success) {
        setSuccessMessage('Photo approved successfully!');
        await fetchPhotos();
        setSelectedPhotoForFeedback(null);
        setFeedbackText('');
      }
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setProcessingPhotoId(null);
    }
  };

  const handleReject = async (photoId: string, feedback: string) => {
    if (!feedback.trim()) {
      alert('Please provide feedback when rejecting a photo');
      return;
    }

    setProcessingPhotoId(photoId);
    try {
      const success = await rejectPhoto(photoId, feedback);
      if (success) {
        setSuccessMessage('Photo rejected with feedback.');
        await fetchPhotos();
        setSelectedPhotoForFeedback(null);
        setFeedbackText('');
      }
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setProcessingPhotoId(null);
    }
  };

  const handleDelete = async (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    if (photo.isInCollage) {
      alert('Cannot delete photos that are part of a published collage');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete this photo by ${photo.user?.name || 'Unknown User'}?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      setProcessingPhotoId(photoId);
      try {
        const success = await deletePhoto(photoId);
        if (success) {
          setSuccessMessage('Photo deleted successfully.');
          await fetchPhotos();
        }
      } catch (err) {
        // Error is handled by the hook
      } finally {
        setProcessingPhotoId(null);
      }
    }
  };

  const handleCollageCreated = () => {
    setSuccessMessage('Collage published successfully!');
    setActiveView('photos');
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

  const filteredPhotos = photos;
  const totalPhotos = photos.length;
  const pendingPhotos = photos.filter(p => p.status === 'PENDING').length;
  const approvedPhotos = photos.filter(p => p.status === 'APPROVED').length;
  const rejectedPhotos = photos.filter(p => p.status === 'REJECTED').length;
  const inCollagePhotos = photos.filter(p => p.isInCollage).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Photo Wall Management</h2>
          <p className="text-gray-600 mt-1">Manage photo submissions and create collages</p>
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

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveView('photos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === 'photos'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4" />
              <span>Photo Management</span>
            </div>
          </button>

          <button
            onClick={() => setActiveView('collage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === 'collage'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Create Collage</span>
            </div>
          </button>

          <button
            onClick={() => setActiveView('collage-management')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === 'collage-management'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Collage Management</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Photo Management View */}
      {activeView === 'photos' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-gray-900">{totalPhotos}</div>
              <div className="text-sm text-gray-500">Total Photos</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600">{pendingPhotos}</div>
              <div className="text-sm text-gray-500">Pending Review</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{approvedPhotos}</div>
              <div className="text-sm text-gray-500">Approved</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-red-600">{rejectedPhotos}</div>
              <div className="text-sm text-gray-500">Rejected</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{inCollagePhotos}</div>
              <div className="text-sm text-gray-500">In Collages</div>
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
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status === 'ALL' ? 'All Photos' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Photos Grid */}
          {loading && photos.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading photos...</p>
              </div>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {totalPhotos === 0 ? 'No photos uploaded' : 'No photos match your filter'}
              </h3>
              <p className="text-gray-500">
                {totalPhotos === 0 
                  ? 'Users haven\'t uploaded any photos yet'
                  : 'Try adjusting your filter to see more photos'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
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
                      <span>{photo.status}</span>
                    </div>

                    {/* In Collage Badge */}
                    {photo.isInCollage && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-medium">
                        In Collage
                      </div>
                    )}
                  </div>

                  {/* Photo Details */}
                  <div className="p-4">
                    {/* User Info */}
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {photo.user?.name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({photo.user?.email || 'No email'})
                      </span>
                    </div>

                    {/* Caption */}
                    {photo.caption && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={photo.caption}>
                        "{photo.caption}"
                      </p>
                    )}

                    {/* Upload Date */}
                    <p className="text-xs text-gray-500 mb-3">
                      Uploaded: {new Date(photo.createdAt).toLocaleDateString()}
                    </p>

                    {/* Admin Feedback */}
                    {photo.adminFeedback && (
                      <div className={`p-2 rounded border-l-4 mb-3 ${
                        photo.status === 'APPROVED' 
                          ? 'bg-green-50 border-green-400' 
                          : 'bg-red-50 border-red-400'
                      }`}>
                        <p className="text-xs font-medium text-gray-700">Previous Feedback:</p>
                        <p className="text-xs text-gray-600 mt-1">{photo.adminFeedback}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {photo.status === 'PENDING' && (
                        <>
                          {/* Feedback Input */}
                          {selectedPhotoForFeedback === photo.id && (
                            <div className="space-y-2">
                              <textarea
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="Optional feedback for the user..."
                                rows={2}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent resize-none"
                              />
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                if (selectedPhotoForFeedback === photo.id) {
                                  handleApprove(photo.id, feedbackText);
                                } else {
                                  setSelectedPhotoForFeedback(photo.id);
                                  setFeedbackText('');
                                }
                              }}
                              disabled={processingPhotoId === photo.id}
                              className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                            >
                              {processingPhotoId === photo.id && <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />}
                              <CheckCircle className="h-3 w-3" />
                              <span>Approve</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                if (selectedPhotoForFeedback === photo.id) {
                                  handleReject(photo.id, feedbackText);
                                } else {
                                  setSelectedPhotoForFeedback(photo.id);
                                  setFeedbackText('');
                                }
                              }}
                              disabled={processingPhotoId === photo.id}
                              className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                            >
                              {processingPhotoId === photo.id && <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />}
                              <XCircle className="h-3 w-3" />
                              <span>Reject</span>
                            </button>
                          </div>

                          {/* Feedback Toggle */}
                          {selectedPhotoForFeedback !== photo.id && (
                            <button
                              onClick={() => {
                                setSelectedPhotoForFeedback(photo.id);
                                setFeedbackText('');
                              }}
                              className="w-full px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span>Add Feedback</span>
                            </button>
                          )}
                        </>
                      )}

                      {/* Delete Button (for all statuses, but disabled for collage photos) */}
                      <button
                        onClick={() => handleDelete(photo.id)}
                        disabled={processingPhotoId === photo.id || photo.isInCollage}
                        className="w-full px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                        title={photo.isInCollage ? 'Cannot delete photos that are part of a collage' : 'Delete photo'}
                      >
                        {processingPhotoId === photo.id && <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600" />}
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collage Creation View */}
      {activeView === 'collage' && (
        <AdminCollageCreator onCollageCreated={handleCollageCreated} />
      )}

      {/* Collage Management View */}
      {activeView === 'collage-management' && (
        <CollageManagement />
      )}
    </div>
  );
};

export default PhotoWallTab; 