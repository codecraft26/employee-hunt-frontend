'use client';

import { Provider } from 'react-redux';
import { store } from '../store';
import AuthProvider from '../components/AuthProvider';
import PWAInstaller from '../components/PWAInstaller';
import OfflineIndicator from '../components/OfflineIndicator';
import './globals.css';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, show update notification
                  if (confirm('New version available! Reload to update?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

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
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Employee Hunt" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Employee Hunt" />
        <meta name="description" content="Engage in team activities, quizzes, treasure hunts, and polls with your colleagues" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#4f46e5" />

        {/* Viewport for PWA */}
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, viewport-fit=cover" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon and Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png" />

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
        <meta property="og:title" content="Employee Hunt - Team Activities & Contests" />
        <meta property="og:description" content="Engage in team activities, quizzes, treasure hunts, and polls with your colleagues" />
        <meta property="og:site_name" content="Employee Hunt" />
        <meta property="og:url" content="https://employeehunt.com" />
        <meta property="og:image" content="/icons/icon-512x512.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Employee Hunt - Team Activities & Contests" />
        <meta name="twitter:description" content="Engage in team activities, quizzes, treasure hunts, and polls with your colleagues" />
        <meta name="twitter:image" content="/icons/icon-512x512.png" />

        <title>Employee Hunt - Team Activities & Contests</title>
      </head>
      <body>
        <Provider store={store}>
          <AuthProvider>
            <OfflineIndicator />
            {children}
            <PWAInstaller />
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}