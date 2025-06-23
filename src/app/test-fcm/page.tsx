'use client';

import { useState } from 'react';
import FCMManager from '../../components/FCMManager';
import { useFCM } from '../../hooks/useFCM';
import { ArrowLeft, Smartphone, Bell } from 'lucide-react';
import Link from 'next/link';
import LoginDebugger from '../../components/LoginDebugger';

export default function TestFCMPage() {
  const { fcmToken, isLoading, error, generateToken, isSupported, permission } = useFCM();
  const [testResult, setTestResult] = useState<string>('');

  const handleTestToken = async () => {
    setTestResult('Testing FCM token generation...');
    
    try {
      const token = await generateToken();
      if (token) {
        setTestResult(`✅ Token generated successfully!\nLength: ${token.length} characters`);
      } else {
        setTestResult('❌ Failed to generate token');
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Link 
            href="/login" 
            className="p-2 rounded-lg bg-white shadow hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Bell className="h-6 w-6 text-blue-500" />
              <span>FCM Test Page</span>
            </h1>
            <p className="text-gray-600">Test Firebase Cloud Messaging functionality</p>
          </div>
        </div>

        {/* FCM Manager Component */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Status</h2>
          <FCMManager showToken={true} />
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Browser Support:</span>
              <span className={`font-medium ${isSupported ? 'text-green-600' : 'text-red-600'}`}>
                {isSupported ? '✅ Supported' : '❌ Not Supported'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Permission:</span>
              <span className="font-medium capitalize">{permission || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Token Status:</span>
              <span className={`font-medium ${fcmToken ? 'text-green-600' : 'text-red-600'}`}>
                {fcmToken ? '✅ Generated' : '❌ Not Generated'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loading:</span>
              <span className="font-medium">{isLoading ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Manual Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Test</h2>
          <button
            onClick={handleTestToken}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Testing...' : 'Test Token Generation'}
          </button>
          
          {testResult && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </div>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment Check</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">VAPID Key:</span>
              <span className={`font-medium ${process.env.NEXT_PUBLIC_VAPID_KEY ? 'text-green-600' : 'text-red-600'}`}>
                {process.env.NEXT_PUBLIC_VAPID_KEY ? '✅ Set' : '❌ Missing'}
              </span>
            </div>
            {process.env.NEXT_PUBLIC_VAPID_KEY && (
              <div className="text-xs text-gray-500 break-all">
                {process.env.NEXT_PUBLIC_VAPID_KEY.substring(0, 20)}...
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">How to Test</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Make sure notifications are enabled in your browser</li>
            <li>2. Click "Test Token Generation" to manually test</li>
            <li>3. Check the console for detailed logs</li>
            <li>4. Go to login page to test integration with authentication</li>
          </ol>
        </div>

        {/* Login Diagnostics */}
        <div className="mt-6">
          <LoginDebugger />
        </div>
      </div>
    </div>
  );
}
