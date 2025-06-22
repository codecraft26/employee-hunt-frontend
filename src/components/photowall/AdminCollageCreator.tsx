import React, { useState, useEffect } from 'react';
import { RowsPhotoAlbum } from 'react-photo-album';
import { 
  Palette, 
  Upload, 
  Send, 
  ArrowLeft, 
  Check, 
  Image as ImageIcon, 
  Users,
  Sparkles,
  Download
} from 'lucide-react';
import { usePhotoWall, Photo } from '../../hooks/usePhotoWall';

interface AdminCollageCreatorProps {
  onCollageCreated?: () => void;
  className?: string;
}

const AdminCollageCreator: React.FC<AdminCollageCreatorProps> = ({ 
  onCollageCreated, 
  className = '' 
}) => {
  const {
    getApprovedPhotosForCollage,
    createCollage,
    uploadCollageImage,
    publishCollage,
    loading,
    error,
    setError
  } = usePhotoWall();

  const [step, setStep] = useState(1); // 1: Select photos, 2: Generate, 3: Finalize
  const [approvedPhotos, setApprovedPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [collageTitle, setCollageTitle] = useState('');
  const [collageDescription, setCollageDescription] = useState('');
  const [collageId, setCollageId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchApprovedPhotos();
  }, []);

  const fetchApprovedPhotos = async () => {
    const photos = await getApprovedPhotosForCollage();
    setApprovedPhotos(photos);
  };

  const handlePhotoSelection = (photo: Photo) => {
    setSelectedPhotos(prev => {
      const isSelected = prev.find(p => p.id === photo.id);
      if (isSelected) {
        return prev.filter(p => p.id !== photo.id);
      } else if (prev.length < 10) {
        return [...prev, photo];
      } else {
        alert('Maximum 10 photos can be selected for a collage');
        return prev;
      }
    });
  };

  const handleCreateCollage = async () => {
    if (!collageTitle.trim()) {
      alert('Please enter a collage title');
      return;
    }
    if (selectedPhotos.length < 2) {
      alert('Please select at least 2 photos');
      return;
    }

    try {
      const result = await createCollage(
        collageTitle,
        collageDescription,
        selectedPhotos.map(p => p.id)
      );
      if (result) {
        setCollageId(result.id);
        setStep(2);
      }
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const generateCollageImage = async () => {
    if (!collageId) return;

    setGenerating(true);
    setError(null); // Clear previous errors
    
    try {
      // Prepare data for the Sharp-based API
      const collageData = {
        title: collageTitle,
        description: collageDescription,
        imageUrls: selectedPhotos.map(photo => photo.imageUrl),
        layout: 'grid',
        width: 1200,
        height: 800
      };

      console.log('Starting collage generation with', selectedPhotos.length, 'images');

      // Call the Sharp-based API endpoint with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/collage/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collageData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        if (response.status === 413) {
          throw new Error('Request too large - try with fewer images');
        } else if (response.status === 504) {
          throw new Error('Request timeout - the server took too long to respond');
        } else if (response.status === 502) {
          throw new Error('Server error - please try again in a few moments');
        } else {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
      }

      const result = await response.json();

      if (result.success) {
        console.log('Collage generated successfully, uploading...');
        
        // Convert base64 image to blob for upload
        const base64Data = result.data.imageUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        // Upload the generated collage
        const uploadSuccess = await uploadCollageImage(collageId, blob);
        if (uploadSuccess) {
          setStep(3);
          
          // Show success message with processing details
          if (result.data.failedImages > 0) {
            console.warn(`${result.data.failedImages} images failed to process and were replaced with placeholders`);
            // You could show a toast notification here about failed images
          }
        } else {
          throw new Error('Failed to upload collage image');
        }
      } else {
        throw new Error(result.message || 'Failed to generate collage');
      }

    } catch (error) {
      console.error('Failed to generate collage image:', error);
      
      let errorMessage = 'Failed to generate collage';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out - please try again with fewer images';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout - please try again';
        } else if (error.message.includes('memory')) {
          errorMessage = 'Memory limit exceeded - try with fewer images';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error - please check your connection and try again';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handlePublishCollage = async () => {
    if (!collageId) return;

    setPublishing(true);
    try {
      const success = await publishCollage(collageId);
      if (success) {
        // Reset form
        setSelectedPhotos([]);
        setCollageTitle('');
        setCollageDescription('');
        setStep(1);
        setCollageId(null);
        onCollageCreated?.();
      }
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setPublishing(false);
    }
  };

  // Convert photos to react-photo-album format
  const albumPhotos = selectedPhotos.map(photo => ({
    src: photo.imageUrl,
    width: 800,
    height: 600,
    alt: photo.caption || 'Photo',
    key: photo.id,
  }));

  const resetFlow = () => {
    setStep(1);
    setSelectedPhotos([]);
    setCollageTitle('');
    setCollageDescription('');
    setCollageId(null);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${className}`}>
      {/* Header with Steps */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Palette className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Create New Collage</h2>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === stepNum
                  ? 'bg-purple-600 text-white'
                  : step > stepNum
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step > stepNum ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span className={`ml-2 text-sm ${
                step >= stepNum ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {stepNum === 1 ? 'Select Photos' : stepNum === 2 ? 'Generate Collage' : 'Publish'}
              </span>
              {stepNum < 3 && <div className="w-8 h-px bg-gray-300 ml-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Step 1: Select Photos */}
      {step === 1 && (
        <div className="p-6">
          {/* Form Inputs */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collage Title *
              </label>
              <input
                type="text"
                value={collageTitle}
                onChange={(e) => setCollageTitle(e.target.value)}
                placeholder="Enter a catchy title for your collage"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={collageDescription}
                onChange={(e) => setCollageDescription(e.target.value)}
                placeholder="Add a description for your collage"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                maxLength={500}
              />
            </div>
          </div>

          {/* Photo Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium text-gray-900">
                Select Photos ({selectedPhotos.length}/10)
              </h3>
              <div className="text-sm text-gray-500">
                {approvedPhotos.length} approved photos available
              </div>
            </div>

            {approvedPhotos.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Photos</h3>
                <p className="text-gray-500">There are no approved photos available for creating collages.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {approvedPhotos.map((photo) => {
                  const isSelected = selectedPhotos.find(p => p.id === photo.id);
                  return (
                    <div
                      key={photo.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                        isSelected
                          ? 'ring-4 ring-purple-500 ring-opacity-50 transform scale-95'
                          : 'hover:ring-2 hover:ring-purple-300'
                      }`}
                      onClick={() => handlePhotoSelection(photo)}
                    >
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={photo.imageUrl}
                          alt={photo.caption || 'Photo'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                      )}

                      {/* Photo Info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-white text-xs font-medium truncate">
                          {photo.user?.name || 'Unknown User'}
                        </p>
                        {photo.caption && (
                          <p className="text-white/80 text-xs truncate">
                            {photo.caption}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={handleCreateCollage}
              disabled={loading || selectedPhotos.length < 2 || !collageTitle.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
              <Sparkles className="h-4 w-4" />
              <span>{loading ? 'Creating...' : 'Create Collage'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Generate Collage */}
      {step === 2 && (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-2">Generate Collage Image</h3>
            <p className="text-sm text-gray-600">
              The photos will be automatically arranged using Sharp image processing. Click generate to create the collage image.
            </p>
          </div>

          {/* Selected Photos Preview */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Photos ({selectedPhotos.length})</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {selectedPhotos.map((photo, index) => (
                <div key={photo.id} className="relative">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Selection</span>
            </button>
            
            <button
              onClick={generateCollageImage}
              disabled={generating}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {generating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
              <Download className="h-4 w-4" />
              <span>{generating ? 'Generating...' : 'Generate Collage Image'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Finalize and Publish */}
      {step === 3 && (
        <div className="p-6">
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">🎉 Collage Ready!</h3>
            <p className="text-gray-600 mb-6">
              Your collage has been created and the image has been generated using Sharp. Ready to publish?
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-2">Publishing Information</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Publishing will make this collage visible to all users</li>
                <li>• The current published collage (if any) will be archived</li>
                <li>• Users will be able to view and like the new collage</li>
                <li>• Photos used in this collage will be marked as "In Collage"</li>
              </ul>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={resetFlow}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Create Another
              </button>
              
              <button
                onClick={handlePublishCollage}
                disabled={publishing}
                className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {publishing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                <Send className="h-4 w-4" />
                <span>{publishing ? 'Publishing...' : 'Publish Collage'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollageCreator; 