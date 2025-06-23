'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Share, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    
    // Check if running on iOS
    const iosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iosDevice);

    // Check if already installed on iOS
    if (iosDevice) {
      setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Don't show anything if already installed/standalone
  if (isInstalled || isStandalone) {
    return null;
  }

  // iOS Instructions Modal
  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full text-gray-900">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Install App</h3>
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Share size={16} className="text-blue-600" />
              </div>
              <p>Tap the <strong>Share</strong> button in Safari</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Plus size={16} className="text-green-600" />
              </div>
              <p>Scroll down and tap <strong>"Add to Home Screen"</strong></p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Download size={16} className="text-purple-600" />
              </div>
              <p>Tap <strong>"Add"</strong> to install the app</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowIOSInstructions(false)}
            className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    );
  }

  // Install prompt for Android/Desktop
  if (isInstallable && !isIOS) {
    return (
      <div className="fixed top-4 left-4 right-4 bg-white shadow-lg rounded-lg p-4 z-40 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Install App</h4>
            <p className="text-sm text-gray-600">Add this app to your home screen for quick access</p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setIsInstallable(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <button
              onClick={handleInstallClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS install hint (show after delay)
  if (isIOS && !isInstalled && !dismissed) {
    return (
      <div className="fixed top-4 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 z-40">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-blue-900">Install this app</h4>
            <p className="text-sm text-blue-700">
              Tap <Share size={14} className="inline mx-1" /> then "Add to Home Screen"
            </p>
          </div>
          <button
            onClick={handleInstallClick}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors mr-2"
          >
            Show me how
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="ml-2 text-blue-900 hover:text-blue-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAInstaller;
