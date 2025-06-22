'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Zap } from 'lucide-react';

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
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };
    checkIfInstalled();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          // User accepted the PWA installation
        }
        setDeferredPrompt(null);
      });
    }
  };

  const handleDismiss = () => {
    setDeferredPrompt(null);
  };

  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 animate-bounce-in">
      <div className="gaming-card p-6 backdrop-blur-xl border border-white/20 shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-lg"></div>
        
        <div className="relative z-10">
          <div className="flex items-start space-x-4">
            {/* Enhanced Icon */}
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Download className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                Install the App
                <Zap className="h-4 w-4 ml-2 text-yellow-400 animate-pulse" />
              </h3>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                Get the ultimate gaming experience with faster loading and offline access! 🎮
              </p>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleInstallClick}
                  className="btn-gaming neon-glow flex-1 flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install Now
                </button>
                <button 
                  onClick={handleDismiss} 
                  className="p-3 text-gray-400 hover:text-white transition-colors duration-300 group bg-white/5 rounded-xl hover:bg-white/10 border border-white/10"
                >
                  <X className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstaller; 