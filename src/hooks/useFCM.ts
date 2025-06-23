import { useEffect, useState, useCallback } from 'react';
import FCMUtils from '../utils/fcmUtils';
import { useAppDispatch } from './redux';
import { updateDeviceToken } from '../store/authSlice';

interface UseFCMReturn {
  fcmToken: string | null;
  isLoading: boolean;
  error: string | null;
  generateToken: () => Promise<string | null>;
  isSupported: boolean;
  permission: NotificationPermission | null;
}

/**
 * Custom hook to manage FCM tokens and push notifications
 */
export const useFCM = (): UseFCMReturn => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  // Check if notifications are supported
  const isSupported = FCMUtils.isNotificationSupported();
  const permission = FCMUtils.getNotificationPermission();

  /**
   * Generate FCM token
   */
  const generateToken = useCallback(async (): Promise<string | null> => {
    if (!isSupported) {
      setError('Notifications are not supported in this browser');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await FCMUtils.getOrGenerateFCMToken();
      
      if (token) {
        setFcmToken(token);
        // Update token on the server
        try {
          await dispatch(updateDeviceToken(token));
        } catch (serverError) {
          console.warn('Failed to update device token on server:', serverError);
          // Don't throw error here as token generation was successful
        }
      } else {
        setError('Failed to generate FCM token');
      }

      return token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('FCM token generation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, dispatch]);

  /**
   * Initialize FCM token on mount - only check for existing token, don't auto-generate
   */
  useEffect(() => {
    const initializeFCM = async () => {
      if (!isSupported) {
        return;
      }

      // Only check for existing stored token, don't auto-generate
      const storedToken = FCMUtils.getStoredFCMToken();
      if (storedToken) {
        setFcmToken(storedToken);
      }
    };

    initializeFCM();
  }, [isSupported]); // Removed permission and generateToken dependencies

  return {
    fcmToken,
    isLoading,
    error,
    generateToken,
    isSupported,
    permission,
  };
};

export default useFCM;
