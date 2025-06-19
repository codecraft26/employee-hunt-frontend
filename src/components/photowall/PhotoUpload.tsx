import React, { useState, useCallback } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { usePhotoWall, Photo } from '../../hooks/usePhotoWall';

interface PhotoUploadProps {
  onUploadSuccess?: (photo: Photo) => void;
  className?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onUploadSuccess, className = '' }) => {
  const { uploadPhoto, loading, error, clearError } = usePhotoWall();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    clearError();
  }, [clearError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const photo = await uploadPhoto(selectedFile, caption);
      if (photo) {
        setUploadSuccess(true);
        setSelectedFile(null);
        setPreview(null);
        setCaption('');
        onUploadSuccess?.(photo);
        
        // Clear success message after 3 seconds
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (err) {
      // Error is handled by the hook
    }
  }, [selectedFile, caption, uploadPhoto, onUploadSuccess]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
    clearError();
  }, [clearError]);

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Camera className="h-5 w-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">Upload Photo</h2>
      </div>

      {/* Success Message */}
      {uploadSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <p className="text-green-700 text-sm">Photo uploaded successfully! Waiting for admin approval.</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-purple-500 bg-purple-50'
            : preview
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-64 mx-auto rounded-lg object-cover"
            />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div>
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag & drop a photo here, or click to select
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports: JPEG, PNG, GIF (Max: 10MB)
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
            >
              <Camera className="h-4 w-4 mr-2" />
              Select Photo
            </label>
          </div>
        )}
      </div>

      {/* Caption Input */}
      {selectedFile && (
        <div className="mt-4 space-y-2">
          <label htmlFor="caption" className="block text-sm font-medium text-gray-700">
            Caption (Optional)
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption to your photo..."
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <div className="text-right text-xs text-gray-500">
            {caption.length}/500 characters
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
            <Upload className="h-4 w-4" />
            <span>{loading ? 'Uploading...' : 'Upload Photo'}</span>
          </button>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Upload Guidelines</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• High-quality images work best for collages</li>
          <li>• Keep content appropriate and workplace-friendly</li>
          <li>• Your photo will be reviewed by an admin before approval</li>
          <li>• Approved photos may be featured in team collages</li>
        </ul>
      </div>
    </div>
  );
};

export default PhotoUpload; 