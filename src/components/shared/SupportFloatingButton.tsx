import React from 'react';

const WHATSAPP_NUMBER = '919999419103';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

const SupportFloatingButton: React.FC = () => (
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
);

export default SupportFloatingButton; 