'use client';

import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface PendingApprovalMessageProps {
  message?: string;
}

const PendingApprovalMessage: React.FC<PendingApprovalMessageProps> = ({ 
  message = "Your account is pending approval. Please wait for admin approval before logging in."
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Account Pending Approval
          </h2>
          
          <div className="flex items-center text-yellow-600 mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Status: Pending</span>
          </div>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          <div className="w-full bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                Admin will review your account details
              </li>
              <li className="flex items-start">
                <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                You'll receive an email once approved
              </li>
              <li className="flex items-start">
                <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                Then you can log in and access all features
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalMessage; 