'use client';

import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/clientStorage';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check for standalone mode (installed as PWA)
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true ||
          document.referrer.includes('android-app://')) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    const isCurrentlyInstalled = checkIfInstalled();

    // Debug logging for mobile browsers
    console.log('PWA Installer Debug:', {
      isInstalled: isCurrentlyInstalled,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
      standalone: typeof window !== 'undefined' ? (window.navigator as any).standalone : false,
      displayMode: typeof window !== 'undefined' ? window.matchMedia('(display-mode: standalone)').matches : false,
      dismissedBefore: getLocalStorageItem('pwa-install-dismissed')
    });

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a shorter delay for better testing
      setTimeout(() => {
        if (!isCurrentlyInstalled && !getLocalStorageItem('pwa-install-dismissed')) {
          console.log('Showing install prompt');
          setShowInstallPrompt(true);
        }
      }, 2000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // For iOS Safari, show manual install instructions
    const checkiOSSafari = () => {
      if (typeof window === 'undefined') return;
      
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (isIOS && isSafari && !isCurrentlyInstalled && !getLocalStorageItem('pwa-install-dismissed')) {
        console.log('iOS Safari detected, showing manual install prompt');
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Check for iOS Safari
    checkiOSSafari();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // Check if this is iOS Safari (no beforeinstallprompt support)
    if (typeof window === 'undefined') return;
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
      // Show iOS install instructions
      alert('To install this app on your iOS device:\n\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm');
      return;
    }

    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      // Fallback for browsers that don't support beforeinstallprompt
      alert('To install this app:\n\n• On Android Chrome: Use the "Add to Home Screen" option in the menu\n• On iOS Safari: Use "Add to Home Screen" from the share menu');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        setLocalStorageItem('pwa-install-dismissed', 'true');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setLocalStorageItem('pwa-install-dismissed', 'true');
  };

  // Show install prompt if conditions are met
  if (isInstalled) {
    return null;
  }

  // Show for iOS Safari even without deferredPrompt
  if (typeof window !== 'undefined') {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (!showInstallPrompt && !(isIOS && isSafari)) {
      return null;
    }
  } else if (!showInstallPrompt) {
    // During SSR, don't show anything
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-slide-up">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Install Employee Hunt</h3>
              <p className="text-xs text-gray-600">Get the full app experience</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Works offline
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Faster loading
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            Push notifications
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstaller; 