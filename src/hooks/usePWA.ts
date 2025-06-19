'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/clientStorage';

interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  isInstallable: boolean;
  hasUpdate: boolean;
  isLoading: boolean;
}

interface PWAActions {
  installApp: () => Promise<boolean>;
  updateApp: () => void;
  dismissInstall: () => void;
  checkForUpdates: () => Promise<void>;
}

interface UsePWAReturn extends PWAState, PWAActions {}

let deferredPrompt: any = null;

export const usePWA = (): UsePWAReturn => {
  const [state, setState] = useState<PWAState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInstalled: false,
    isInstallable: false,
    hasUpdate: false,
    isLoading: false,
  });

  // Check if app is installed
  const checkInstallStatus = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = (window.navigator as any).standalone === true;
    const isInstalled = isStandalone || isIOS;
    
    setState(prev => ({ ...prev, isInstalled }));
    return isInstalled;
  }, []);

  // Install the app
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn('Install prompt not available');
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
        setState(prev => ({ 
          ...prev, 
          isInstallable: false, 
          isInstalled: true,
          isLoading: false 
        }));
        deferredPrompt = null;
        return true;
      } else {
        console.log('PWA installation dismissed');
        setLocalStorageItem('pwa-install-dismissed', Date.now().toString());
        setState(prev => ({ 
          ...prev, 
          isInstallable: false,
          isLoading: false 
        }));
        return false;
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  // Update the app
  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  }, []);

  // Dismiss install prompt
  const dismissInstall = useCallback(() => {
    setState(prev => ({ ...prev, isInstallable: false }));
    setLocalStorageItem('pwa-install-dismissed', Date.now().toString());
    deferredPrompt = null;
  }, []);

  // Check for service worker updates
  const checkForUpdates = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check initial install status
    checkInstallStatus();

    // Online/offline status
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Check if user previously dismissed the install prompt
      const dismissed = getLocalStorageItem('pwa-install-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show install prompt if not dismissed or dismissed more than 7 days ago
      if (!dismissed || daysSinceDismissed > 7) {
        setState(prev => ({ ...prev, isInstallable: true }));
      }
    };

    // App installed
    const handleAppInstalled = () => {
      console.log('PWA installed successfully');
      setState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        isInstallable: false 
      }));
      deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setState(prev => ({ ...prev, hasUpdate: true }));
      });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATED') {
          setState(prev => ({ ...prev, hasUpdate: true }));
        }
      });

      // Check for updates periodically
      const updateInterval = setInterval(checkForUpdates, 60000); // Check every minute

      return () => {
        clearInterval(updateInterval);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkInstallStatus, checkForUpdates]);

  return {
    ...state,
    installApp,
    updateApp,
    dismissInstall,
    checkForUpdates,
  };
};

// Utility functions for PWA features
export const PWAUtils = {
  // Check if running as PWA
  isPWA: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  },

  // Get PWA display mode
  getDisplayMode: (): string => {
    if (typeof window === 'undefined') return 'browser';
    
    if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
    if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
    if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
    return 'browser';
  },

  // Check if device supports PWA installation
  canInstall: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Check for various PWA support indicators
    return 'serviceWorker' in navigator && 
           'PushManager' in window &&
           'Notification' in window;
  },

  // Request notification permission
  requestNotificationPermission: async (): Promise<NotificationPermission> => {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  },

  // Show notification
  showNotification: (title: string, options?: NotificationOptions): void => {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          ...options,
        });
      });
    }
  },

  // Cache management
  clearCache: async (): Promise<void> => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  },

  // Get cache size
  getCacheSize: async (): Promise<number> => {
    if (!('caches' in window)) return 0;
    
    let totalSize = 0;
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    return totalSize;
  },
}; 