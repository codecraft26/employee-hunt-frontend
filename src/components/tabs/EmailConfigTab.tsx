// components/tabs/EmailConfigTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  X, 
  AlertCircle, 
  RefreshCw, 
  Mail,
  Shield,
  Server,
  User,
  Lock,
  TestTube,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useEmailConfig } from '../../hooks/useEmailConfig';
import { 
  EmailConfig, 
  CreateEmailConfigRequest, 
  UpdateEmailConfigRequest,
  TestEmailConfigRequest 
} from '../../types/admin';

const EmailConfigTab: React.FC = () => {
  const {
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
  } = useEmailConfig();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<EmailConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{ isValid: boolean; message?: string } | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateEmailConfigRequest>({
    host: '',
    port: 587,
    secure: false,
    user: '',
    password: '',
    description: '',
    isActive: false
  });

  const [editForm, setEditForm] = useState<UpdateEmailConfigRequest>({
    host: '',
    port: 587,
    secure: false,
    user: '',
    password: '',
    description: '',
    isActive: false
  });

  const [testForm, setTestForm] = useState<TestEmailConfigRequest>({
    host: '',
    port: 587,
    secure: false,
    user: '',
    password: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchConfigs();
    fetchActiveConfig();
  }, [fetchConfigs, fetchActiveConfig]);

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Debug modal state
  useEffect(() => {
    console.log('Modal state changed - showEditModal:', showEditModal, 'selectedConfig:', selectedConfig);
  }, [showEditModal, selectedConfig]);

  // Common email provider presets
  const emailPresets = [
    {
      name: 'Gmail',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: '',
        password: '',
        description: 'Gmail SMTP Configuration'
      }
    },
    {
      name: 'Outlook/Hotmail',
      config: {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        user: '',
        password: '',
        description: 'Outlook/Hotmail SMTP Configuration'
      }
    },
    {
      name: 'Yahoo Mail',
      config: {
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false,
        user: '',
        password: '',
        description: 'Yahoo Mail SMTP Configuration'
      }
    },
    {
      name: 'Gmail (SSL)',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        user: '',
        password: '',
        description: 'Gmail SMTP Configuration with SSL'
      }
    }
  ];

  const handleCreateConfig = async () => {
    if (!createForm.host || !createForm.port || !createForm.user || !createForm.password) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createConfig(createForm);
      setShowCreateModal(false);
      setCreateForm({
        host: '',
        port: 587,
        secure: false,
        user: '',
        password: '',
        description: '',
        isActive: false
      });
    } catch (err) {
      console.error('Failed to create email configuration:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditConfig = (config: EmailConfig) => {
    console.log('Edit button clicked for config:', config);
    setSelectedConfig(config);
    setEditForm({
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user,
      password: '',
      description: config.description || '',
      isActive: config.isActive
    });
    setShowEditModal(true);
    console.log('Edit modal should be open now');
  };

  const handleUpdateConfig = async () => {
    if (!selectedConfig) return;

    setIsSubmitting(true);
    try {
      await updateConfig(selectedConfig.id, editForm);
      setShowEditModal(false);
      setSelectedConfig(null);
      setEditForm({
        host: '',
        port: 587,
        secure: false,
        user: '',
        password: '',
        description: '',
        isActive: false
      });
    } catch (err) {
      console.error('Failed to update email configuration:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfig = async () => {
    if (!selectedConfig) return;

    setIsSubmitting(true);
    try {
      await deleteConfig(selectedConfig.id);
      setShowDeleteModal(false);
      setSelectedConfig(null);
    } catch (err) {
      console.error('Failed to delete email configuration:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateConfig = async (config: EmailConfig) => {
    try {
      await activateConfig(config.id);
    } catch (err) {
      console.error('Failed to activate email configuration:', err);
    }
  };

  const handleTestConfig = async () => {
    if (!testForm.host || !testForm.port || !testForm.user || !testForm.password) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await testConfig(testForm);
      setTestResult(result);
    } catch (err) {
      setTestResult({ isValid: false, message: 'Test failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyPreset = (preset: typeof emailPresets[0]) => {
    setCreateForm({
      ...createForm,
      ...preset.config
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Configuration</h2>
          <p className="text-gray-600">Manage email server settings for the application</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Configuration</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Debug Modal State */}
      {showEditModal && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-700">Edit Modal is open! Selected config: {selectedConfig?.host}</span>
          </div>
        </div>
      )}

      {/* Active Configuration Card */}
      {activeConfig && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">Active Configuration</h3>
                <p className="text-green-700">{activeConfig.description || `${activeConfig.user} (${activeConfig.host})`}</p>
              </div>
            </div>
            <div className="text-sm text-green-600">
              Last updated: {formatDate(activeConfig.updatedAt)}
            </div>
          </div>
        </div>
      )}

      {/* Configurations List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Email Configurations</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Loading configurations...</p>
          </div>
        ) : configs.length === 0 ? (
          <div className="p-6 text-center">
            <Mail className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No configurations</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first email configuration.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {configs.map((config) => (
              <div key={config.id} className="p-6">
                <div className="space-y-4">
                  {/* Configuration Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Server className="w-5 h-5 text-gray-400" />
                      <h4 className="font-medium text-gray-900">
                        {config.description || `${config.user} (${config.host})`}
                      </h4>
                      {config.isActive && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowTestModal(true)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Test Configuration"
                      >
                        <TestTube className="w-4 h-4" />
                      </button>
                      
                      {!config.isActive && (
                        <button
                          onClick={() => handleActivateConfig(config)}
                          className="text-green-600 hover:text-green-800 p-2"
                          title="Activate Configuration"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleEditConfig(config)}
                        className="text-gray-600 hover:text-gray-800 p-2"
                        title="Edit Configuration"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedConfig(config);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Delete Configuration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Editable Configuration Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={config.host}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Port
                      </label>
                      <input
                        type="number"
                        value={config.port}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                        placeholder="587"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username/Email
                      </label>
                      <input
                        type="email"
                        value={config.user}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value="••••••••"
                          readOnly
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                          placeholder="Password"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Security
                      </label>
                      <input
                        type="text"
                        value={config.secure ? 'SSL/TLS' : 'STARTTLS'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={config.description || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                        placeholder="Configuration description"
                      />
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                    Created: {formatDate(config.createdAt)} • Updated: {formatDate(config.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Configuration Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Create Email Configuration</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Email Provider Presets */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Setup (Email Provider Presets)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {emailPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-gray-500">{preset.config.host}:{preset.config.port}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host *
                  </label>
                  <input
                    type="text"
                    value={createForm.host}
                    onChange={(e) => setCreateForm({ ...createForm, host: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port *
                  </label>
                  <input
                    type="number"
                    value={createForm.port}
                    onChange={(e) => setCreateForm({ ...createForm, port: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username/Email *
                  </label>
                  <input
                    type="email"
                    value={createForm.user}
                    onChange={(e) => setCreateForm({ ...createForm, user: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your password or app password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={createForm.secure}
                    onChange={(e) => setCreateForm({ ...createForm, secure: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Use SSL/TLS</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={createForm.isActive}
                    onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Set as active</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Primary Gmail configuration"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConfig}
                disabled={isSubmitting || !createForm.host || !createForm.port || !createForm.user || !createForm.password}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Configuration Modal */}
      {showEditModal && selectedConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Edit Email Configuration</h3>
              <button
                onClick={() => {
                  console.log('Close button clicked');
                  setShowEditModal(false);
                  setSelectedConfig(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={editForm.host}
                    onChange={(e) => setEditForm({ ...editForm, host: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={editForm.port}
                    onChange={(e) => setEditForm({ ...editForm, port: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username/Email
                  </label>
                  <input
                    type="email"
                    value={editForm.user}
                    onChange={(e) => setEditForm({ ...editForm, user: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password (leave blank to keep current)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter new password or leave blank"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.secure}
                    onChange={(e) => setEditForm({ ...editForm, secure: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Use SSL/TLS</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Set as active</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  console.log('Cancel button clicked');
                  setShowEditModal(false);
                  setSelectedConfig(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateConfig}
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Configuration Modal */}
      {showDeleteModal && selectedConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-medium">Delete Configuration</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the email configuration for <strong>{selectedConfig.host}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfig}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Configuration Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Test Email Configuration</h3>
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setTestResult(null);
                  setTestForm({
                    host: '',
                    port: 587,
                    secure: false,
                    user: '',
                    password: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host *
                  </label>
                  <input
                    type="text"
                    value={testForm.host}
                    onChange={(e) => setTestForm({ ...testForm, host: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port *
                  </label>
                  <input
                    type="number"
                    value={testForm.port}
                    onChange={(e) => setTestForm({ ...testForm, port: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username/Email *
                  </label>
                  <input
                    type="email"
                    value={testForm.user}
                    onChange={(e) => setTestForm({ ...testForm, user: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={testForm.password}
                      onChange={(e) => setTestForm({ ...testForm, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your password or app password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={testForm.secure}
                    onChange={(e) => setTestForm({ ...testForm, secure: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Use SSL/TLS</span>
                </label>
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`p-4 rounded-lg ${
                  testResult.isValid 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {testResult.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`font-medium ${
                      testResult.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.isValid ? 'Test Successful' : 'Test Failed'}
                    </span>
                  </div>
                  {testResult.message && (
                    <p className={`mt-1 text-sm ${
                      testResult.isValid ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {testResult.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setTestResult(null);
                  setTestForm({
                    host: '',
                    port: 587,
                    secure: false,
                    user: '',
                    password: ''
                  });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={handleTestConfig}
                disabled={isSubmitting || !testForm.host || !testForm.port || !testForm.user || !testForm.password}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Testing...' : 'Test Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailConfigTab;
