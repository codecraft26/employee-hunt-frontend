import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

// Unified API Configuration
const API_CONFIG = {
  // Main API base URL
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  
  // External collage generation API endpoint
  COLLAGE_API_URL: process.env.NEXT_PUBLIC_COLLAGE_API_URL || 'http://localhost:5000/api/collage/generate',
  
  // API timeout in milliseconds
  TIMEOUT: 60000, // 60 seconds
  
  // Request headers for main API
  getMainHeaders: () => {
    const token = Cookies.get('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  
  // Request headers for external collage API
  getCollageHeaders: () => {
    const adminToken = Cookies.get('adminToken') || Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    };
  }
};

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const headers = API_CONFIG.getMainHeaders();
  if (headers.Authorization) {
    config.headers.Authorization = headers.Authorization;
  }
  return config;
});

// Collage generation request interface
interface ExternalCollageRequest {
  title?: string;
  description?: string;
  imageUrls: string[];
  layout?: string;
  width?: number;
  height?: number;
}

// Collage generation response interface
interface ExternalCollageResponse {
  success: boolean;
  data?: {
    imageUrl: string;
    processedImages: number;
    failedImages: number;
    failedImageErrors: Array<{ index: number; error: string }>;
  };
  message?: string;
}

export interface Photo {
  id: string;
  imageUrl: string;
  caption?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminFeedback?: string;
  isInCollage: boolean;
  collagePosition?: number;
  isPrivate?: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  submittedBy?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Collage {
  id: string;
  title: string;
  description?: string;
  collageImageUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  layoutConfig?: any;
  viewCount: number;
  likeCount: number;
  selectedPhotos?: Photo[];
  isGenerated: boolean;
  createdBy: {
    id: string;
    name: string;
  };
  publishedBy?: {
    id: string;
    name: string;
  };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollageRequest {
  title: string;
  description?: string;
  selectedPhotoIds: string[];
  layoutConfig?: any;
}

export interface PhotoUploadResponse {
  success: boolean;
  message: string;
  data: Photo;
}

export interface CollageResponse {
  success: boolean;
  message: string;
  data: Collage;
}

export interface PhotosResponse {
  success: boolean;
  message: string;
  data: Photo[];
}

export interface CollagesResponse {
  success: boolean;
  message: string;
  data: Collage[];
}

export const usePhotoWall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // User Functions
  const uploadPhoto = useCallback(async (file: File, caption?: string, isPrivate?: boolean): Promise<Photo | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      if (caption) {
        formData.append('caption', caption);
      }
      if (isPrivate !== undefined) {
        formData.append('isPrivate', isPrivate.toString());
      }

      const response = await api.post<PhotoUploadResponse>('/photo-wall/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to upload photo';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserPhotos = useCallback(async (status?: string): Promise<Photo[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = status ? { status } : {};
      const response = await api.get<PhotosResponse>('/photo-wall/my-photos', { params });
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch user photos';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentCollage = useCallback(async (): Promise<Collage | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<CollageResponse>('/photo-wall/current-collage');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to fetch current collage');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch collage';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPublishedCollages = useCallback(async (): Promise<Collage[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<CollagesResponse>('/photo-wall/published-collages');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to fetch published collages');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch published collages';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const likeCollage = useCallback(async (collageId: string): Promise<{ likeCount: number } | 'already-liked' | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/photo-wall/collages/${collageId}/like`) as any;
      
      // Check if the response has the expected structure
      if (response && response.success && response.data) {
        return response.data;
      } else if (response && response.message && response.message.includes('already liked')) {
        return 'already-liked';
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('Like collage error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 409) {
        // Conflict - already liked
        return 'already-liked';
      } else if (err.response?.data?.message) {
        const errorMessage = err.response.data.message;
        if (errorMessage.includes('already liked')) {
          return 'already-liked';
        }
        setError(errorMessage);
      } else {
        const errorMessage = err.message || 'Failed to like collage';
        setError(errorMessage);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin Functions
  const getAllPhotos = useCallback(async (status?: string): Promise<Photo[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = status ? { status } : {};
      const response = await api.get<PhotosResponse>('/photo-wall/admin/photos', { params });
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch photos';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const approvePhoto = useCallback(async (photoId: string, feedback?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.put(`/photo-wall/admin/photos/${photoId}/approve`, { feedback });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to approve photo';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectPhoto = useCallback(async (photoId: string, feedback: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.put(`/photo-wall/admin/photos/${photoId}/reject`, { feedback });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reject photo';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePhoto = useCallback(async (photoId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(`/photo-wall/admin/photos/${photoId}`);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete photo';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getApprovedPhotosForCollage = useCallback(async (): Promise<Photo[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<PhotosResponse>('/photo-wall/admin/approved-photos');
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch approved photos';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createCollage = useCallback(async (
    title: string, 
    description: string, 
    selectedPhotoIds: string[], 
    layoutConfig?: any
  ): Promise<Collage | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<CollageResponse>('/photo-wall/admin/collages', {
        title,
        description,
        selectedPhotoIds,
        layoutConfig,
      });
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create collage';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to compress image
  const compressImage = (file: Blob, quality: number = 0.8, maxWidth: number = 1920): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadCollageImage = useCallback(async (collageId: string, imageBlob: Blob): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Compress the image before uploading
      const compressedBlob = await compressImage(imageBlob, 0.8, 1920);
      
      const formData = new FormData();
      formData.append('collageImage', compressedBlob, `collage-${collageId}.jpg`);

      await api.put(`/photo-wall/admin/collages/${collageId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to upload collage image';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const publishCollage = useCallback(async (collageId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.put(`/photo-wall/admin/collages/${collageId}/publish`);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to publish collage';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllCollages = useCallback(async (): Promise<Collage[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<CollagesResponse>('/photo-wall/admin/collages');
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch collages';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getCollageById = useCallback(async (collageId: string): Promise<Collage | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<CollageResponse>(`/photo-wall/admin/collages/${collageId}`);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch collage';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCollage = useCallback(async (collageId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(`/photo-wall/admin/collages/${collageId}`);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete collage';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // New collage generation function
  const generateCollageImage = useCallback(async (params: {
    title: string;
    description: string;
    imageUrls: string[];
    layout?: string;
    width?: number;
    height?: number;
  }): Promise<{ success: boolean; data?: any; message?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting collage generation with', params.imageUrls.length, 'images');

      // Prepare request data
      const requestData: ExternalCollageRequest = {
        title: params.title,
        description: params.description,
        imageUrls: params.imageUrls,
        layout: params.layout || 'grid',
        width: params.width || 1200,
        height: params.height || 800
      };

      console.log('Request data:', requestData);

      // Use external API endpoint for collage generation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(API_CONFIG.COLLAGE_API_URL, {
        method: 'POST',
        headers: API_CONFIG.getCollageHeaders(),
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication failed - please check your admin token');
        } else if (response.status === 413) {
          throw new Error('Request too large - try with fewer images');
        } else if (response.status === 504) {
          throw new Error('Request timeout - the server took too long to respond');
        } else if (response.status === 502) {
          throw new Error('Server error - please try again in a few moments');
        } else {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
      }

      const result: ExternalCollageResponse = await response.json();

      if (result.success && result.data) {
        console.log('Collage generated successfully');
        console.log('Processing stats:', {
          processedImages: result.data.processedImages,
          failedImages: result.data.failedImages
        });
        
        return {
          success: true,
          data: result.data
        };
      } else {
        throw new Error(result.message || 'Failed to generate collage');
      }

    } catch (error) {
      console.error('Failed to generate collage image:', error);
      
      let errorMessage = 'Failed to generate collage';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out - please try again with fewer images';
        } else if (error.message.includes('Authentication failed')) {
          errorMessage = 'Authentication failed - please check your admin token';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout - please try again with fewer images';
        } else if (error.message.includes('memory')) {
          errorMessage = 'Memory limit exceeded - try with fewer images';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error - please check your connection and try again';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to convert base64 to blob
  const convertBase64ToBlob = useCallback((base64Image: string): Blob => {
    const base64Data = base64Image.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/jpeg' });
  }, []);

  // Complete collage generation workflow
  const generateAndUploadCollage = useCallback(async (params: {
    collageId: string;
    title: string;
    description: string;
    imageUrls: string[];
    layout?: string;
    width?: number;
    height?: number;
  }): Promise<boolean> => {
    try {
      // Step 1: Generate collage image
      const generationResult = await generateCollageImage({
        title: params.title,
        description: params.description,
        imageUrls: params.imageUrls,
        layout: params.layout,
        width: params.width,
        height: params.height
      });

      if (!generationResult.success || !generationResult.data) {
        return false;
      }

      // Step 2: Convert base64 to blob
      const imageBlob = convertBase64ToBlob(generationResult.data.imageUrl);

      // Step 3: Upload the generated collage
      const uploadSuccess = await uploadCollageImage(params.collageId, imageBlob);
      
      if (uploadSuccess) {
        console.log('Collage generated and uploaded successfully');
        
        // Log processing details
        if (generationResult.data.failedImages > 0) {
          console.warn(`${generationResult.data.failedImages} images failed to process and were replaced with placeholders`);
        }
        
        return true;
      } else {
        console.error('Failed to upload collage image');
        return false;
      }

    } catch (error) {
      console.error('Failed in collage generation workflow:', error);
      return false;
    }
  }, [generateCollageImage, convertBase64ToBlob, uploadCollageImage]);

  return {
    loading,
    error,
    clearError,
    setError,
    
    // User functions
    uploadPhoto,
    getUserPhotos,
    getCurrentCollage,
    getPublishedCollages,
    likeCollage,
    
    // Admin functions
    getAllPhotos,
    approvePhoto,
    rejectPhoto,
    deletePhoto,
    getApprovedPhotosForCollage,
    createCollage,
    uploadCollageImage,
    publishCollage,
    getAllCollages,
    getCollageById,
    deleteCollage,
    
    // New collage generation functions
    generateCollageImage,
    generateAndUploadCollage,
  };
};

// Collage management functions
export const useCollageManagement = () => {
  const [collageLoading, setCollageLoading] = useState(false);
  const [collageError, setCollageError] = useState<string | null>(null);

  const clearCollageError = () => setCollageError(null);

  // Get all collages
  const getAllCollages = async (): Promise<Collage[]> => {
    setCollageLoading(true);
    setCollageError(null);
    try {
      const response = await api.get<CollagesResponse>('/photo-wall/admin/collages');
      return response.data.data || [];
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch collages';
      setCollageError(errorMessage);
      return [];
    } finally {
      setCollageLoading(false);
    }
  };

  // Get only generated collages
  const getGeneratedCollages = async (): Promise<Collage[]> => {
    setCollageLoading(true);
    setCollageError(null);
    try {
      const response = await api.get<CollagesResponse>('/photo-wall/admin/collages/generated');
      return response.data.data || [];
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch generated collages';
      setCollageError(errorMessage);
      return [];
    } finally {
      setCollageLoading(false);
    }
  };

  // Get specific collage details
  const getCollageDetails = async (collageId: string): Promise<Collage | null> => {
    setCollageLoading(true);
    setCollageError(null);
    try {
      const response = await api.get<CollageResponse>(`/photo-wall/admin/collages/${collageId}`);
      return response.data.data || null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch collage details';
      setCollageError(errorMessage);
      return null;
    } finally {
      setCollageLoading(false);
    }
  };

  // Create new collage manually
  const createCollage = async (collageData: CreateCollageRequest): Promise<Collage | null> => {
    setCollageLoading(true);
    setCollageError(null);
    try {
      const response = await api.post<CollageResponse>('/photo-wall/admin/collages', collageData);
      return response.data.data || null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create collage';
      setCollageError(errorMessage);
      return null;
    } finally {
      setCollageLoading(false);
    }
  };

  // Generate collage from URLs
  const generateCollage = async (urls: string[]): Promise<Collage | null> => {
    setCollageLoading(true);
    setCollageError(null);
    try {
      const response = await api.post<CollageResponse>('/photo-wall/generate-collage', { urls });
      return response.data.data || null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to generate collage';
      setCollageError(errorMessage);
      return null;
    } finally {
      setCollageLoading(false);
    }
  };

  // Upload collage image
  const uploadCollageImage = async (collageId: string, imageFile: File): Promise<boolean> => {
    setCollageLoading(true);
    setCollageError(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.put(`/photo-wall/admin/collages/${collageId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to upload collage image';
      setCollageError(errorMessage);
      return false;
    } finally {
      setCollageLoading(false);
    }
  };

  // Publish collage
  const publishCollage = async (collageId: string): Promise<boolean> => {
    setCollageLoading(true);
    setCollageError(null);
    try {
      await api.put(`/photo-wall/admin/collages/${collageId}/publish`);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to publish collage';
      setCollageError(errorMessage);
      return false;
    } finally {
      setCollageLoading(false);
    }
  };

  // Delete collage
  const deleteCollage = async (collageId: string): Promise<boolean> => {
    setCollageLoading(true);
    setCollageError(null);
    try {
      await api.delete(`/photo-wall/admin/collages/${collageId}`);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete collage';
      setCollageError(errorMessage);
      return false;
    } finally {
      setCollageLoading(false);
    }
  };

  return {
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
  };
}; 