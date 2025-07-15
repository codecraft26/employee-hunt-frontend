import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  TeamMemberSubmission, 
  TeamClueSubmission, 
  SubmitMemberClueRequest, 
  ApproveSubmissionRequest,
  RejectSubmissionRequest,
  MemberSubmissionsResponse,
  TeamSubmissionsResponse 
} from '../types/teams';
import { uploadTreasureHuntMemberSubmission, validateImageFile } from '../services/s3Service';

// Get API base URL
const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    console.warn('NEXT_PUBLIC_API_URL environment variable is not set');
    return 'http://localhost:5000/api';
  }
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const adminToken = Cookies.get('adminToken') || localStorage.getItem('adminToken');
    const regularToken = Cookies.get('token');
    const token = adminToken || regularToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🚀 Member Submissions API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      timestamp: new Date().toISOString()
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ Member Submissions API Response:', {
      method: response.config?.method?.toUpperCase(),
      url: response.config?.url,
      status: response.status,
      success: response.data?.success,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    console.error('❌ Member Submissions API Error:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
  }
);

export const useMemberSubmissions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberSubmissions, setMemberSubmissions] = useState<TeamMemberSubmission[]>([]);
  const [teamSubmissions, setTeamSubmissions] = useState<TeamClueSubmission[]>([]);

  // Helper function to handle API errors
  const handleApiError = (err: any, defaultMessage: string): string => {
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.response?.status === 401) {
      return 'Authentication failed. Please login again.';
    }
    if (err.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (err.response?.status === 404) {
      return 'Resource not found.';
    }
    if (err.response?.status === 500) {
      return 'Server error. Please try again later.';
    }
    return err.message || defaultMessage;
  };

  // Submit member image for a clue
  const submitMemberClue = useCallback(async (
    clueId: string, 
    teamId: string, 
    image: File, 
    description: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📸 Submitting member clue:', { clueId, teamId, description, imageSize: image.size });
      
      // Validate image file before upload
      const validation = validateImageFile(image);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid image file');
      }

      // Upload image to S3 first
      const imageUrl = await uploadTreasureHuntMemberSubmission(image);

      // Send the S3 URL to the backend
      const requestData = {
        imageUrl,
        teamId,
        description
      };

      const response = await api.post(
        `/team-member-submissions/clues/${clueId}/submit`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        console.log('✅ Member clue submitted successfully');
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to submit clue');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to submit clue');
      console.error('❌ Submit member clue error:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get member's own submissions for a team
  const fetchMySubmissions = useCallback(async (teamId: string): Promise<TeamMemberSubmission[]> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👤 Fetching my submissions for team:', teamId);
      
      const response = await api.get<MemberSubmissionsResponse>(
        `/team-member-submissions/teams/${teamId}/my-submissions`
      );

      if (response.data.success) {
        console.log('✅ My submissions fetched successfully:', response.data.data.length);
        setMemberSubmissions(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch submissions');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to fetch your submissions');
      console.error('❌ Fetch my submissions error:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // [LEADER] Get all member submissions for a clue to review
  const fetchSubmissionsForReview = useCallback(async (
    teamId: string, 
    clueId: string
  ): Promise<TeamMemberSubmission[]> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👑 Fetching submissions for review:', { teamId, clueId });
      
      const response = await api.get<MemberSubmissionsResponse>(
        `/team-member-submissions/teams/${teamId}/clues/${clueId}/review`
      );

      if (response.data.success) {
        console.log('✅ Submissions for review fetched successfully:', response.data.data.length);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch submissions for review');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to fetch submissions for review');
      console.error('❌ Fetch submissions for review error:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // [LEADER] Approve member submission (automatically sends to admin)
  const approveSubmission = useCallback(async (
    submissionId: string,
    leaderNotes?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👑 Approving member submission:', {
        submissionId,
        leaderNotes
      });
      
      const requestData: ApproveSubmissionRequest = {
        submissionId,
        leaderNotes
      };

      const response = await api.post(
        `/team-member-submissions/${submissionId}/approve`,
        requestData
      );

      if (response.data.success) {
        console.log('✅ Submission approved and sent to admin automatically');
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to approve submission');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to approve submission');
      console.error('❌ Approve submission error:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // [LEADER] Reject member submission
  const rejectSubmission = useCallback(async (
    submissionId: string,
    leaderNotes?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👑 Rejecting member submission:', {
        submissionId,
        leaderNotes
      });
      
      const requestData: RejectSubmissionRequest = {
        submissionId,
        leaderNotes
      };

      const response = await api.post(
        `/team-member-submissions/${submissionId}/reject`,
        requestData
      );

      if (response.data.success) {
        console.log('✅ Submission rejected successfully');
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to reject submission');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to reject submission');
      console.error('❌ Reject submission error:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // [LEADER] Get all team submissions across all clues
  const fetchAllTeamSubmissions = useCallback(async (teamId: string): Promise<TeamClueSubmission[]> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👑 Fetching all team submissions:', teamId);
      
      const response = await api.get<TeamSubmissionsResponse>(
        `/team-member-submissions/teams/${teamId}/all-submissions`
      );

      if (response.data.success) {
        console.log('✅ All team submissions fetched successfully:', response.data.data.length);
        setTeamSubmissions(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch team submissions');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to fetch team submissions');
      console.error('❌ Fetch team submissions error:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // [ADMIN] Get all team submissions for a treasure hunt
  const fetchTreasureHuntSubmissions = useCallback(async (treasureHuntId: string): Promise<TeamClueSubmission[]> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔧 Fetching treasure hunt submissions for admin:', treasureHuntId);
      
      const response = await api.get<TeamSubmissionsResponse>(
        `/treasure-hunts/${treasureHuntId}/submissions`
      );

      if (response.data.success) {
        console.log('✅ Treasure hunt submissions fetched successfully:', response.data.data.length);
        setTeamSubmissions(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch treasure hunt submissions');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to fetch treasure hunt submissions');
      console.error('❌ Fetch treasure hunt submissions error:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // [ADMIN] Approve team submission
  const approveTeamSubmission = useCallback(async (
    treasureHuntId: string,
    submissionId: string,
    feedback?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('✅ Approving team submission:', { treasureHuntId, submissionId, feedback });
      
      const response = await api.post(
        `/treasure-hunts/${treasureHuntId}/submissions/${submissionId}/approve`,
        { feedback }
      );

      if (response.data.success) {
        console.log('✅ Team submission approved successfully');
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to approve submission');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to approve submission');
      console.error('❌ Approve submission error:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // [ADMIN] Reject team submission
  const rejectTeamSubmission = useCallback(async (
    treasureHuntId: string,
    submissionId: string,
    feedback?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('❌ Rejecting team submission:', { treasureHuntId, submissionId, feedback });
      
      const response = await api.post(
        `/treasure-hunts/${treasureHuntId}/submissions/${submissionId}/reject`,
        { feedback }
      );

      if (response.data.success) {
        console.log('✅ Team submission rejected successfully');
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to reject submission');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to reject submission');
      console.error('❌ Reject submission error:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // [ADMIN] Get teams progress for a treasure hunt
  const fetchTeamsProgress = useCallback(async (treasureHuntId: string): Promise<any[]> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching teams progress:', treasureHuntId);
      
      const response = await api.get(`/treasure-hunts/${treasureHuntId}/teams-progress`);

      if (response.data.success) {
        console.log('✅ Teams progress fetched successfully:', response.data.data.length);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch teams progress');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Failed to fetch teams progress');
      console.error('❌ Fetch teams progress error:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear submissions
  const clearSubmissions = useCallback(() => {
    setMemberSubmissions([]);
    setTeamSubmissions([]);
  }, []);

  return {
    // State
    loading,
    error,
    memberSubmissions,
    teamSubmissions,

    // Member functions
    submitMemberClue,
    fetchMySubmissions,

    // Leader functions
    fetchSubmissionsForReview,
    approveSubmission,
    rejectSubmission,
    fetchAllTeamSubmissions,

    // Admin functions
    fetchTreasureHuntSubmissions,
    approveTeamSubmission,
    rejectTeamSubmission,
    fetchTeamsProgress,

    // Utility functions
    clearError,
    clearSubmissions,
  };
}; 