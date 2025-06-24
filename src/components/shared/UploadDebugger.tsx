import React, { useState } from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface DebugInfo {
  apiUrl: string;
  isOnline: boolean;
  localStorage: any;
  cookies: any;
  browserInfo: string;
  fileSupport: {
    formData: boolean;
    fileReader: boolean;
    canvas: boolean;
  };
}

const UploadDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [connectionTest, setConnectionTest] = useState<{
    status: 'idle' | 'testing' | 'success' | 'failed';
    message: string;
  }>({ status: 'idle', message: '' });

  const checkEnvironment = () => {
    const info: DebugInfo = {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'Not set',
      isOnline: navigator.onLine,
      localStorage: typeof Storage !== 'undefined' ? 'Supported' : 'Not supported',
      cookies: document.cookie ? 'Available' : 'Not available',
      browserInfo: navigator.userAgent,
      fileSupport: {
        formData: typeof FormData !== 'undefined',
        fileReader: typeof FileReader !== 'undefined',
        canvas: typeof HTMLCanvasElement !== 'undefined' && typeof CanvasRenderingContext2D !== 'undefined'
      }
    };
    setDebugInfo(info);
  };

  const testConnection = async () => {
    setIsChecking(true);
    setConnectionTest({ status: 'testing', message: 'Testing connection...' });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setConnectionTest({ 
          status: 'success', 
          message: `Connection successful (${response.status})` 
        });
      } else {
        setConnectionTest({ 
          status: 'failed', 
          message: `Server responded with ${response.status}` 
        });
      }
    } catch (error: any) {
      setConnectionTest({ 
        status: 'failed', 
        message: `Connection failed: ${error.message}` 
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md border z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Upload Debugger</h3>
        <button
          onClick={checkEnvironment}
          className="text-blue-600 hover:text-blue-800"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {debugInfo && (
        <div className="space-y-2 text-xs">
          <div>
            <span className="font-medium">API URL:</span> {debugInfo.apiUrl}
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Online:</span>
            {debugInfo.isOnline ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <AlertCircle className="h-3 w-3 text-red-500" />
            )}
            <span>{debugInfo.isOnline ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="font-medium">File Support:</span>
            <ul className="ml-2 mt-1">
              <li className="flex items-center space-x-1">
                {debugInfo.fileSupport.formData ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
                <span>FormData: {debugInfo.fileSupport.formData ? 'Yes' : 'No'}</span>
              </li>
              <li className="flex items-center space-x-1">
                {debugInfo.fileSupport.fileReader ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
                <span>FileReader: {debugInfo.fileSupport.fileReader ? 'Yes' : 'No'}</span>
              </li>
              <li className="flex items-center space-x-1">
                {debugInfo.fileSupport.canvas ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
                <span>Canvas: {debugInfo.fileSupport.canvas ? 'Yes' : 'No'}</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t">
        <button
          onClick={testConnection}
          disabled={isChecking}
          className="w-full text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isChecking ? 'Testing...' : 'Test Server Connection'}
        </button>
        
        {connectionTest.status !== 'idle' && (
          <div className={`mt-2 flex items-center space-x-2 text-xs ${
            connectionTest.status === 'success' ? 'text-green-600' : 
            connectionTest.status === 'failed' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {connectionTest.status === 'success' && <CheckCircle className="h-3 w-3" />}
            {connectionTest.status === 'failed' && <AlertCircle className="h-3 w-3" />}
            <span>{connectionTest.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadDebugger;
