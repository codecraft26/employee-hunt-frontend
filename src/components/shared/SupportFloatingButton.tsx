import React, { useState } from 'react';
import { BellOff, X } from 'lucide-react';

const WHATSAPP_NUMBER = '919999419103';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

const NotificationIssuePopup: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center mb-4">
          <BellOff className="h-7 w-7 text-red-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Notification Issue?</h2>
        </div>
        <div className="text-gray-700 space-y-2 text-sm">
          <p>If you are not receiving notifications, try the following steps:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Clear site data and cookie in your browser.</li>
            <li>Logout from your account.</li>
            <li>Login again and allow notifications when prompted.</li>
          </ol>
          <p className="mt-2">If the issue persists, contact support.</p>
        </div>
      </div>
    </div>
  );
};

const SupportFloatingButton: React.FC<{ dashboardOnly?: boolean }> = ({ dashboardOnly }) => {
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  // Only render on dashboard if dashboardOnly is true and window.location.pathname is not /dashboard, return null
  if (dashboardOnly && typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard')) {
    return null;
  }
  return (
    <>
      {/* Existing Support Button (bottom left) */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact Support"
        className="fixed z-50 bottom-6 left-6 sm:bottom-8 sm:right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 transition-all duration-200 group"
        style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)' }}
      >
        {/* Generic Support Icon (Headset) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8 sm:w-10 sm:h-10"
        >
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3" />
          <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3" />
        </svg>
        <span className="absolute opacity-0 group-hover:opacity-100 bg-black bg-opacity-80 text-white text-xs rounded px-2 py-1 left-0 right-0 mx-auto bottom-16 sm:bottom-20 pointer-events-none transition-opacity duration-200 whitespace-nowrap">
          Support
        </span>
      </a>
      {/* Notification Issue Text (bottom right, dashboard only) */}
      <button
        onClick={() => setShowNotifPopup(true)}
        aria-label="Notification Issue"
        className="fixed z-50 bottom-3 right-3 sm:bottom-4 sm:right-8 text-xs text-red-600 bg-white bg-opacity-40 rounded px-2 py-1 shadow border border-red-100 transition-all duration-200 hover:bg-opacity-70 hover:border-red-200"
        style={{ fontSize: '11px', zIndex: 100, opacity: 0.6 }}
      >
        Notification issue?
      </button>
      <NotificationIssuePopup open={showNotifPopup} onClose={() => setShowNotifPopup(false)} />
    </>
  );
};

export default SupportFloatingButton; 