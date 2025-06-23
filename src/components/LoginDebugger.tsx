'use client';

import { useState } from 'react';
import { useAppDispatch } from '../hooks/redux';
import { loginUser } from '../store/authSlice';
import FCMUtils from '../utils/fcmUtils';

export default function LoginDebugger() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const dispatch = useAppDispatch();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Environment Variables
      addResult('🔍 Checking environment variables...');
      addResult(`API URL: ${process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}`);
      addResult(`VAPID Key: ${process.env.NEXT_PUBLIC_VAPID_KEY ? 'SET' : 'NOT SET'}`);
      
      // Test 2: FCM Support
      addResult('🔍 Checking FCM support...');
      const isSupported = FCMUtils.isNotificationSupported();
      addResult(`FCM Supported: ${isSupported ? 'YES' : 'NO'}`);
      
      const permission = FCMUtils.getNotificationPermission();
      addResult(`Notification Permission: ${permission || 'UNKNOWN'}`);
      
      // Test 3: FCM Token Generation
      addResult('🔍 Testing FCM token generation (silent)...');
      try {
        const token = await FCMUtils.getOrGenerateFCMToken(false); // Don't request permission
        addResult(`FCM Token: ${token ? 'GENERATED' : 'FAILED'}`);
      } catch (fcmError) {
        addResult(`FCM Error: ${fcmError instanceof Error ? fcmError.message : 'Unknown error'}`);
      }
      
      // Test 4: API Connectivity
      addResult('🔍 Testing API connectivity...');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        addResult(`API Health Check: ${response.ok ? 'SUCCESS' : `FAILED (${response.status})`}`);
      } catch (apiError) {
        addResult(`API Error: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
      }
      
      // Test 5: Login Endpoint Test
      addResult('🔍 Testing login endpoint (without credentials)...');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: '',
            password: ''
          }),
        });
        addResult(`Login Endpoint: ${response.status === 400 || response.status === 401 ? 'REACHABLE' : `UNEXPECTED (${response.status})`}`);
      } catch (loginError) {
        addResult(`Login Endpoint Error: ${loginError instanceof Error ? loginError.message : 'Unknown error'}`);
      }
      
      addResult('✅ Diagnostics complete!');
      
    } catch (error) {
      addResult(`❌ Diagnostics failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testLogin = async () => {
    setIsRunning(true);
    
    try {
      addResult('🧪 Testing login with demo credentials...');
      
      const testCredentials = {
        email: 'test@example.com',
        password: 'testpassword'
      };
      
      const result = await dispatch(loginUser(testCredentials));
      addResult(`Login Test Result: ${JSON.stringify(result, null, 2)}`);
      
    } catch (error) {
      addResult(`❌ Login test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Login Diagnostics</h2>
      
      <div className="space-y-3 mb-4">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run Diagnostics'}
        </button>
        
        <button
          onClick={testLogin}
          disabled={isRunning}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {isRunning ? 'Testing...' : 'Test Login'}
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
          <h3 className="font-medium mb-2">Test Results:</h3>
          <div className="space-y-1 text-sm font-mono">
            {testResults.map((result, index) => (
              <div key={index} className="text-gray-700">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
