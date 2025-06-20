import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const apiService = {
  async get(endpoint: string) {
    try {
      const token = Cookies.get('token');
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
      const token = Cookies.get('token');
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
      const token = Cookies.get('token');
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
      const token = Cookies.get('token');
      const response = await axios.delete(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      return response.data;
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },

  // Dashboard methods
  getDashboardStats: () => apiService.get('/api/admin/dashboard/stats'),
  getTeams: () => apiService.get('/api/admin/teams'),
  getActiveVotes: () => apiService.get('/api/admin/votes/active'),
  getUpcomingVotes: () => apiService.get('/api/admin/votes/upcoming'),
  getCompletedVotes: () => apiService.get('/api/admin/votes/completed'),
  getPendingApprovals: () => apiService.get('/api/auth/users/pending'),
  getRecentActivities: () => apiService.get('/api/admin/activities'),
  approveItem: (id: string, action: 'approve' | 'reject') => 
    apiService.post(`/api/auth/users/${id}/${action}`),
  createVote: (data: any) => apiService.post('/api/admin/votes', data)
};

export { apiService }; 