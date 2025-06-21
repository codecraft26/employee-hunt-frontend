'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, HelpCircle } from 'lucide-react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/clientStorage';
import PWAInstallGuide from './PWAInstallGuide';

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
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

    // Check if user is on mobile
    const checkIfMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      return mobile;
    };

    const isCurrentlyInstalled = checkIfInstalled();
    const isCurrentlyMobile = checkIfMobile();

    // Debug logging
    console.log('PWA Installer Debug:', {
      isInstalled: isCurrentlyInstalled,
      isMobile: isCurrentlyMobile,
      userAgent: navigator.userAgent,
      standalone: (window.navigator as any).standalone,
      displayMode: window.matchMedia('(display-mode: standalone)').matches,
      dismissedBefore: getLocalStorageItem('pwa-install-dismissed'),
      isHTTPS: location.protocol === 'https:',
      isLocalhost: location.hostname === 'localhost'
    });

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt immediately for supported browsers
      if (!isCurrentlyInstalled && !getLocalStorageItem('pwa-install-dismissed')) {
        console.log('Showing install prompt (beforeinstallprompt)');
        setShowInstallPrompt(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Show install prompt for mobile devices after a delay
    const showMobilePrompt = () => {
      if (isCurrentlyMobile && !isCurrentlyInstalled && !getLocalStorageItem('pwa-install-dismissed')) {
        console.log('Showing mobile install prompt');
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Show prompt for mobile devices
    showMobilePrompt();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available, showing guide');
      setShowInstallGuide(true);
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
      setShowInstallGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setLocalStorageItem('pwa-install-dismissed', 'true');
  };

  const handleShowGuide = () => {
    setShowInstallGuide(true);
  };

  // Determine if the install banner should be shown.
  const canShowInstallPrompt = !isInstalled && (typeof window !== 'undefined' && !getLocalStorageItem('pwa-install-dismissed'));

  if (!canShowInstallPrompt) {
    return null;
  }

  return (
    <>
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
              {deferredPrompt ? 'Install' : 'How to Install'}
            </button>
            <button
              onClick={handleShowGuide}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Show installation guide"
            >
              <HelpCircle className="h-4 w-4" />
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

      <PWAInstallGuide 
        isOpen={showInstallGuide} 
        onClose={() => setShowInstallGuide(false)} 
      />
    </>
  );
};

export default PWAInstaller; 