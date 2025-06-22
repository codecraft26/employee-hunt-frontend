// PWA utility functions for Bann Dhann

export interface PWAInstallPrompt extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAStatus {
  isInstalled: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  canInstall: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

/**
 * Detect if the app is running as a PWA
 */
export const isPWA = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://') ||
    window.location.search.includes('utm_source=pwa')
  );
};

/**
 * Detect if the app is installed
 */
export const isInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

/**
 * Detect user platform
 */
export const getPlatform = (): PWAStatus['platform'] => {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  if (/windows|macintosh|linux/.test(userAgent)) return 'desktop';
  
  return 'unknown';
};

/**
 * Get comprehensive PWA status
 */
export const getPWAStatus = (): PWAStatus => {
  if (typeof window === 'undefined') {
    return {
      isInstalled: false,
      isStandalone: false,
      isOnline: false,
      canInstall: false,
      platform: 'unknown',
    };
  }

  return {
    isInstalled: isInstalled(),
    isStandalone: isPWA(),
    isOnline: navigator.onLine,
    canInstall: 'serviceWorker' in navigator && 'beforeinstallprompt' in window,
    platform: getPlatform(),
  };
};

/**
 * Show native share API if available
 */
export const shareContent = async (data: {
  title: string;
  text: string;
  url?: string;
}): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  if (navigator.share && navigator.canShare) {
    try {
      if (navigator.canShare(data)) {
        await navigator.share(data);
        return true;
      }
    } catch (error) {
      console.warn('Native share failed:', error);
    }
  }
  
  // Fallback to clipboard
  if (navigator.clipboard && data.url) {
    try {
      await navigator.clipboard.writeText(data.url);
      return true;
    } catch (error) {
      console.warn('Clipboard write failed:', error);
    }
  }
  
  return false;
};

/**
 * Handle PWA installation
 */
export const installPWA = async (
  deferredPrompt: PWAInstallPrompt | null
): Promise<boolean> => {
  if (!deferredPrompt) return false;
  
  try {
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    return choiceResult.outcome === 'accepted';
  } catch (error) {
    console.error('PWA installation failed:', error);
    return false;
  }
};

/**
 * Register for push notifications
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission === 'denied') {
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Notification permission request failed:', error);
    return false;
  }
};

/**
 * Show local notification
 */
export const showNotification = (
  title: string,
  options: NotificationOptions = {}
): boolean => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission !== 'granted') {
    return false;
  }
  
  try {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'bann-dhann',
      requireInteraction: false,
      ...options,
    });
    return true;
  } catch (error) {
    console.error('Failed to show notification:', error);
    return false;
  }
};

/**
 * Handle app updates
 */
export const handleAppUpdate = (): void => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (confirm('App updated! Reload to get the latest version?')) {
      window.location.reload();
    }
  });
};

/**
 * Add to home screen instructions for iOS
 */
export const getIOSInstallInstructions = (): string[] => {
  const platform = getPlatform();
  
  if (platform === 'ios') {
    return [
      '1. Tap the Share button',
      '2. Scroll down and tap "Add to Home Screen"',
      '3. Tap "Add" to install the app',
    ];
  }
  
  return [];
};

/**
 * Vibrate device if supported (for game feedback)
 */
export const vibrate = (pattern: number | number[] = 100): boolean => {
  if (typeof window === 'undefined' || !navigator.vibrate) {
    return false;
  }
  
  try {
    navigator.vibrate(pattern);
    return true;
  } catch (error) {
    console.warn('Vibration failed:', error);
    return false;
  }
};

/**
 * Keep screen awake during games/activities
 */
export const requestWakeLock = async (): Promise<WakeLockSentinel | null> => {
  if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
    return null;
  }
  
  try {
    const wakeLock = await (navigator as any).wakeLock.request('screen');
    return wakeLock;
  } catch (error) {
    console.warn('Wake lock failed:', error);
    return null;
  }
};

/**
 * Check for app updates
 */
export const checkForUpdates = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return true;
    }
  } catch (error) {
    console.warn('Update check failed:', error);
  }
  
  return false;
};
