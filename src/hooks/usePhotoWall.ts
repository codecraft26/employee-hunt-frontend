import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Photo {
  id: string;
  imageUrl: string;
  caption?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminFeedback?: string;
  isInCollage: boolean;
  collagePosition?: number;
  user: {
    id: string;
    name: string;
    email: string;
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
  selectedPhotos: Photo[];
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
  const uploadPhoto = useCallback(async (file: File, caption?: string): Promise<Photo | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      if (caption) {
        formData.append('caption', caption);
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
      return response.data.data;
    } catch (err: any) {
      // If no current collage, return null without setting error
      if (err.response?.status === 404) {
        return null;
      }
      const errorMessage = err.response?.data?.message || 'Failed to fetch current collage';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const likeCollage = useCallback(async (collageId: string): Promise<{ likeCount: number } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/photo-wall/collages/${collageId}/like`);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to like collage';
      setError(errorMessage);
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

  const uploadCollageImage = useCallback(async (collageId: string, imageBlob: Blob): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('collageImage', imageBlob, `collage-${collageId}.jpg`);

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

  return {
    loading,
    error,
    clearError,
    
    // User functions
    uploadPhoto,
    getUserPhotos,
    getCurrentCollage,
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
  };
}; 