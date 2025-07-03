'use client';

import { Provider } from 'react-redux';
import { store } from '../store';
import AuthProvider from '../components/AuthProvider';

import PWAInstaller from '../components/PWAInstaller';
import OfflineIndicator from '../components/OfflineIndicator';
import { ToastProvider } from '../components/shared/ToastContainer';
import './globals.css';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Unregister all service workers except firebase-messaging-sw.js
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        registrations.forEach(function(registration) {
          if (
            !registration.active ||
            !registration.active.scriptURL.endsWith('/firebase-messaging-sw.js')
          ) {
            registration.unregister();
          }
        });
      });
    }
  }, []);

  useEffect(() => {
    // Register service worker with enhanced mobile support
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          // Clear any stale registrations in development
          if (process.env.NODE_ENV === 'development') {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              if (registration.scope !== window.location.origin + '/') {
                await registration.unregister();
              }
            }
          }

          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });
          
          console.log('Service Worker registered successfully:', registration);
          
          // Enhanced update checking
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available
                  if (confirm('New version available! Reload to update?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });

          // Force update check
          registration.update();
          
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };

      registerServiceWorker();

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          window.location.reload();
        }
      });
    }
  }, []);

  return (
    <html lang="en">
      <head>
        {/* Viewport for PWA - improved mobile support */}
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, viewport-fit=cover, user-scalable=yes" />

        {/* Enhanced PWA Meta Tags */}
        <meta name="application-name" content="बंधन" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="बंधन" />
        <meta name="description" content="Engage in team activities, quizzes, treasure hunts, and polls with your colleagues" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#4f46e5" />
        
        {/* Additional mobile optimization */}
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-orientation" content="portrait" />
        <meta name="screen-orientation" content="portrait" />
        <meta name="full-screen" content="yes" />
        <meta name="browsermode" content="application" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon and Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png?v=2" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png?v=2" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png?v=2" />

        {/* Splash Screens for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* SEO and Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="बंधन - Team Activities & Contests" />
        <meta property="og:description" content="Engage in team activities, quizzes, treasure hunts, and polls with your colleagues" />
        <meta property="og:site_name" content="बंधन" />
        <meta property="og:url" content="https://employeehunt.com" />
        <meta property="og:image" content="/icons/icon-512x512.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="बंधन - Team Activities & Contests" />
        <meta name="twitter:description" content="Engage in team activities, quizzes, treasure hunts, and polls with your colleagues" />
        <meta name="twitter:image" content="/icons/icon-512x512.png" />

        <title>बंधन - Team Activities & Contests</title>
      </head>
      <body>
        <Provider store={store}>
          <AuthProvider>
            <ToastProvider>
              <OfflineIndicator />
              <PWAInstaller />
              {children}
            </ToastProvider>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}