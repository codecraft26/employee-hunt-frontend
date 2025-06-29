import React, { useState, useCallback } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { usePhotoWall, Photo } from '../../hooks/usePhotoWall';
import imageCompression from 'browser-image-compression';

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

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
  
    let processedFile = file;
  
    // Compress if larger than 10MB
    if (file.size > 2 * 1024 * 1024) {
      try {
        const options = {
          maxSizeMB: file.size / (1024 * 1024 * 20), // reduce size 5 times
          useWebWorker: true,
        };
        processedFile = await imageCompression(file, options);
      } catch (error) {
        console.error('Compression failed:', error);
        alert('Failed to compress the image');
        return;
      }
    }
  
    setSelectedFile(processedFile);
  
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(processedFile);
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

  // Handle camera capture
  const handleCameraCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.style.position = 'fixed';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.zIndex = '9999';
      video.style.objectFit = 'cover';
      
      // Create camera overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      overlay.style.zIndex = '9998';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      
      // Create camera controls
      const controls = document.createElement('div');
      controls.style.position = 'fixed';
      controls.style.bottom = '50px';
      controls.style.left = '50%';
      controls.style.transform = 'translateX(-50%)';
      controls.style.zIndex = '10000';
      controls.style.display = 'flex';
      controls.style.gap = '20px';
      
      // Capture button
      const captureBtn = document.createElement('button');
      captureBtn.innerHTML = '📸';
      captureBtn.style.width = '80px';
      captureBtn.style.height = '80px';
      captureBtn.style.borderRadius = '50%';
      captureBtn.style.border = 'none';
      captureBtn.style.backgroundColor = 'white';
      captureBtn.style.fontSize = '32px';
      captureBtn.style.cursor = 'pointer';
      captureBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
      
      // Cancel button
      const cancelBtn = document.createElement('button');
      cancelBtn.innerHTML = '❌';
      cancelBtn.style.width = '60px';
      cancelBtn.style.height = '60px';
      cancelBtn.style.borderRadius = '50%';
      cancelBtn.style.border = 'none';
      cancelBtn.style.backgroundColor = 'red';
      cancelBtn.style.color = 'white';
      cancelBtn.style.fontSize = '24px';
      cancelBtn.style.cursor = 'pointer';
      
      // Add elements to page
      document.body.appendChild(overlay);
      document.body.appendChild(video);
      document.body.appendChild(controls);
      controls.appendChild(cancelBtn);
      controls.appendChild(captureBtn);
      
      // Handle capture
      captureBtn.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            handleFileSelect(file);
          }
        }, 'image/jpeg', 0.8);
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(overlay);
        document.body.removeChild(video);
        document.body.removeChild(controls);
      };
      
      // Handle cancel
      cancelBtn.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(overlay);
        document.body.removeChild(video);
        document.body.removeChild(controls);
      };
      
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please check camera permissions and try again.');
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
              Choose how to add your photo
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Take a photo or select from gallery
            </p>
            
            {/* Photo Upload Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCameraCapture}
                className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Camera className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Take Photo</span>
              </button>
              
              <label className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Choose from Gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="photo-upload"
                />
              </label>
            </div>
            
            {/* Drag & Drop Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                Or drag & drop a photo here (Max: 10MB)
              </p>
            </div>
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