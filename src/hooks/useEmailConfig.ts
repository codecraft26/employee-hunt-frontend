import { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { 
  EmailConfig, 
  CreateEmailConfigRequest, 
  UpdateEmailConfigRequest, 
  TestEmailConfigRequest,
  TestEmailConfigResponse 
} from '../types/admin';

export const useEmailConfig = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configs, setConfigs] = useState<EmailConfig[]>([]);
  const [activeConfig, setActiveConfig] = useState<EmailConfig | null>(null);

  // Get all email configurations
  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get('/admin/email-config');
      if (response.success) {
        setConfigs(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch email configurations');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch email configurations';
      setError(errorMessage);
      console.error('Error fetching email configurations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get active email configuration
  const fetchActiveConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get('/admin/email-config/active');
      if (response.success) {
        setActiveConfig(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch active email configuration');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch active email configuration';
      setError(errorMessage);
      console.error('Error fetching active email configuration:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new email configuration
  const createConfig = useCallback(async (configData: CreateEmailConfigRequest): Promise<EmailConfig> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.post('/admin/email-config', configData);
      if (response.success) {
        // Refresh the configs list
        await fetchConfigs();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create email configuration');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create email configuration';
      setError(errorMessage);
      console.error('Error creating email configuration:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchConfigs]);

  // Update email configuration
  const updateConfig = useCallback(async (id: string, configData: UpdateEmailConfigRequest): Promise<EmailConfig> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.put(`/admin/email-config/${id}`, configData);
      if (response.success) {
        // Refresh the configs list
        await fetchConfigs();
        // If this was the active config, refresh it too
        if (activeConfig?.id === id) {
          await fetchActiveConfig();
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update email configuration');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update email configuration';
      setError(errorMessage);
      console.error('Error updating email configuration:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchConfigs, fetchActiveConfig, activeConfig]);

  // Delete email configuration
  const deleteConfig = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.delete(`/admin/email-config/${id}`);
      if (response.success) {
        // Refresh the configs list
        await fetchConfigs();
        // If this was the active config, refresh it too
        if (activeConfig?.id === id) {
          await fetchActiveConfig();
        }
      } else {
        throw new Error(response.message || 'Failed to delete email configuration');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete email configuration';
      setError(errorMessage);
      console.error('Error deleting email configuration:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchConfigs, fetchActiveConfig, activeConfig]);

  // Set configuration as active
  const activateConfig = useCallback(async (id: string): Promise<EmailConfig> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.patch(`/admin/email-config/${id}/activate`);
      if (response.success) {
        // Refresh both lists
        await fetchConfigs();
        await fetchActiveConfig();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to activate email configuration');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to activate email configuration';
      setError(errorMessage);
      console.error('Error activating email configuration:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchConfigs, fetchActiveConfig]);

  // Test email configuration
  const testConfig = useCallback(async (configData: TestEmailConfigRequest): Promise<TestEmailConfigResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.post('/admin/email-config/test', configData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to test email configuration');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to test email configuration';
      setError(errorMessage);
      console.error('Error testing email configuration:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    configs,
    activeConfig,
    fetchConfigs,
    fetchActiveConfig,
    createConfig,
    updateConfig,
    deleteConfig,
    activateConfig,
    testConfig,
    clearError,
  };
};
