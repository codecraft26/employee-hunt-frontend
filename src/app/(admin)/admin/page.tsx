'use client';

import Link from 'next/link';
import { useAppSelector } from '../../../hooks/redux';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function AdminPage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Welcome to Admin Panel, {user?.name}!
                </h2>
                
                <div className="mb-6">
                  <p className="text-gray-600">
                    This page is only accessible to users with ADMIN role. 
                    Regular users will be redirected to an unauthorized page.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Admin Cards */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-purple-900 mb-2">User Management</h3>
                    <p className="text-purple-700 text-sm">
                      View, edit, and manage user accounts and permissions.
                    </p>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-indigo-900 mb-2">Analytics Dashboard</h3>
                    <p className="text-indigo-700 text-sm">
                      Monitor system usage, user activity, and performance metrics.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-green-900 mb-2">System Configuration</h3>
                    <p className="text-green-700 text-sm">
                      Configure system settings, API keys, and integrations.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-yellow-900 mb-2">Security Settings</h3>
                    <p className="text-yellow-700 text-sm">
                      Manage security policies, audit logs, and access controls.
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-red-900 mb-2">Backup & Recovery</h3>
                    <p className="text-red-700 text-sm">
                      Handle data backups, system recovery, and maintenance tasks.
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Reports</h3>
                    <p className="text-gray-700 text-sm">
                      Generate and download various system and user reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}