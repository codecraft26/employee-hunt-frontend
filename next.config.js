/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing code ...
  
  // Add allowed development origins
  allowedDevOrigins: [
    '192.168.1.8',
    'localhost',
    '127.0.0.1'
  ],
  
  // ... existing code ...
};

module.exports = nextConfig; 