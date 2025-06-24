// Test page to demonstrate the my-activities endpoint
'use client';

import React from 'react';
import MyActivitiesExample from '../../components/examples/MyActivitiesExample';

const TestMyActivitiesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Activities Test</h1>
          <p className="mt-2 text-gray-600">
            This page demonstrates fetching user-specific activities from the{' '}
            <code className="bg-gray-200 px-2 py-1 rounded text-sm">
              /activities/my-activities
            </code>{' '}
            endpoint.
          </p>
        </div>

        <div className="grid gap-6">
          <MyActivitiesExample />
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Implementation Details</h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium text-gray-900">1. API Service Method</h3>
                <p className="text-gray-600 mt-1">
                  Added <code className="bg-gray-100 px-1 rounded">getMyActivities()</code> method to apiService.ts
                </p>
                <pre className="bg-gray-50 p-3 rounded mt-2 overflow-x-auto">
                  <code>{`getMyActivities: () => apiService.get('/activities/my-activities')`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">2. Hook Function</h3>
                <p className="text-gray-600 mt-1">
                  Added <code className="bg-gray-100 px-1 rounded">fetchMyActivities()</code> function to useActivities hook
                </p>
                <pre className="bg-gray-50 p-3 rounded mt-2 overflow-x-auto">
                  <code>{`const { fetchMyActivities } = useActivities();
fetchMyActivities(); // Fetches current user's activities`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">3. Updated Components</h3>
                <p className="text-gray-600 mt-1">
                  Updated UserActivitiesTab component to use the new endpoint
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                  <li>Replaced <code className="bg-gray-100 px-1 rounded">fetchUserActivities</code> with <code className="bg-gray-100 px-1 rounded">fetchMyActivities</code></li>
                  <li>Simplified filtering logic since API returns user-specific data</li>
                  <li>Improved error handling and loading states</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">4. Endpoint Details</h3>
                <div className="bg-gray-50 p-3 rounded mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium">Method:</span> GET
                    </div>
                    <div>
                      <span className="font-medium">Auth:</span> Required (Bearer token)
                    </div>
                    <div className="col-span-full">
                      <span className="font-medium">URL:</span> <code>{process.env.NEXT_PUBLIC_API_URL}/activities/my-activities</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestMyActivitiesPage;
