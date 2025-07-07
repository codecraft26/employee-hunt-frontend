import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get the best available token
const getAuthToken = () => {
  const adminTokenCookie = Cookies.get('adminToken');
  const adminTokenLocal = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const regularToken = Cookies.get('token');
  
  return adminTokenCookie || adminTokenLocal || regularToken;
};

const apiService = {
  async get(endpoint: string) {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      return response.data;
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  async post(endpoint: string, data?: any) {
    try {
      const token = getAuthToken();
      const headers: any = {
        Authorization: token ? `Bearer ${token}` : undefined
      };
      
      // Don't set Content-Type for FormData, let browser set it with boundary
      if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, { headers });
      return response.data;
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  async put(endpoint: string, data?: any) {
    try {
      const token = getAuthToken();
      const headers: any = {
        Authorization: token ? `Bearer ${token}` : undefined
      };
      
      // Don't set Content-Type for FormData, let browser set it with boundary
      if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await axios.put(`${API_BASE_URL}${endpoint}`, data, { headers });
      return response.data;
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      const token = getAuthToken();
      console.log('DELETE request to:', `${API_BASE_URL}${endpoint}`);
      console.log('Using token:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const response = await axios.delete(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      return response.data;
    } catch (error) {
      console.error('API DELETE Error:', error);
      console.error('DELETE endpoint:', endpoint);
      console.error('Full URL:', `${API_BASE_URL}${endpoint}`);
      throw error;
    }
  },

  async patch(endpoint: string, data?: any) {
    try {
      const token = getAuthToken();
      const headers: any = {
        Authorization: token ? `Bearer ${token}` : undefined
      };
      
      // Don't set Content-Type for FormData, let browser set it with boundary
      if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await axios.patch(`${API_BASE_URL}${endpoint}`, data, { headers });
      return response.data;
    } catch (error) {
      console.error('API PATCH Error:', error);
      throw error;
    }
  },

  // Dashboard methods
  getDashboardStats: () => apiService.get('/admin/dashboard/stats'),
  getTeams: () => apiService.get('/admin/teams'),
  getActiveVotes: () => apiService.get('/admin/votes/active'),
  getUpcomingVotes: () => apiService.get('/admin/votes/upcoming'),
  getCompletedVotes: () => apiService.get('/admin/votes/completed'),
  getPendingApprovals: () => apiService.get('/auth/users/pending'),
  getRecentActivities: () => apiService.get('/admin/activities'),
  approveItem: (id: string, action: 'approve' | 'reject') => 
    apiService.post(`/auth/users/${id}/${action}`),
  createVote: (data: any) => apiService.post('/admin/votes', data),

  // User management methods
  getAllUsers: () => apiService.get('/auth/users'),
  getPendingUsers: () => apiService.get('/auth/users/pending'),
  approveUser: (userId: string) => apiService.post(`/auth/users/approve/${userId}`),
  getUserProfile: (userId?: string) => 
    userId ? apiService.get(`/users/${userId}/profile`) : apiService.get('/users/profile'),
  getApprovedUsersForPolls: () => apiService.get('/users/approved-for-polls'),
  assignRoomToUser: (userId: string, roomNumber: string) => 
    apiService.post(`/users/${userId}/assign-room`, { roomNumber }),
  createAdminUser: (data: FormData) => apiService.post('/auth/register/admin', data),
  updateUser: (userId: string, data: any) => apiService.put(`/users/${userId}`, data),
  deleteUser: (userId: string) => apiService.delete(`/users/${userId}`),

  // Room management methods
  getMyRoom: () => apiService.get('/users/my-room'),
  getUserRoom: (userId: string) => apiService.get(`/users/rooms/${userId}`),
  getAllRooms: () => apiService.get('/users/rooms'),
  deleteRoom: (roomIdOrNumber: string) => apiService.delete(`/users/rooms/${roomIdOrNumber}`),

  // Activities methods
  getMyActivities: () => apiService.get('/activities/my-activities'),
  getAllActivities: (limit?: number, page?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (page) params.append('page', page.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiService.get(`/activities${query}`);
  },
  createActivity: (data: FormData) => apiService.post('/activities/create', data),
  deleteActivity: (activityId: string) => apiService.delete(`/activities/${activityId}`),

  assignRoomToMultipleUsers: (userIds: string[], roomNumber: string) =>
    apiService.post('/users/assign-room-multiple', { userIds, roomNumber }),
};

export { apiService };