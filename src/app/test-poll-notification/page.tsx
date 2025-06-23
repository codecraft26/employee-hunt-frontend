'use client';

import React, { useState, useEffect } from 'react';
import { useVotes } from '../../hooks/useVotes';

export default function TestPollNotificationPage() {
  const { getVotes, notifyUsers, loading, error } = useVotes();
  const [polls, setPolls] = useState<any[]>([]);
  const [testPollId, setTestPollId] = useState<string>('');
  const [notifying, setNotifying] = useState(false);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await getVotes();
      if (response?.data) {
        setPolls(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch polls:', err);
    }
  };

  const handleTestNotification = async () => {
    if (!testPollId) {
      setResult('Please enter a poll ID');
      return;
    }

    setNotifying(true);
    setResult('');

    try {
      const success = await notifyUsers(testPollId);
      if (success) {
        setResult('✅ Notification sent successfully!');
      } else {
        setResult('❌ Failed to send notification');
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Poll Notification Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Poll ID to test:</label>
          <input
            type="text"
            value={testPollId}
            onChange={(e) => setTestPollId(e.target.value)}
            placeholder="Enter poll ID"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <button
          onClick={handleTestNotification}
          disabled={notifying || !testPollId}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {notifying ? 'Sending...' : 'Test Notification'}
        </button>

        {result && (
          <div className={`p-4 rounded ${
            result.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {result}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-800 rounded">
            Error: {error}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Available Polls:</h2>
          {loading ? (
            <div className="text-center py-4">Loading polls...</div>
          ) : (
            <div className="space-y-2">
              {polls.map((poll) => (
                <div key={poll.id} className="p-3 border rounded">
                  <div className="font-medium">{poll.title}</div>
                  <div className="text-sm text-gray-600">ID: {poll.id}</div>
                  <div className="text-sm text-gray-600">Status: {poll.status}</div>
                  <div className="text-sm text-gray-600">
                    Results Published: {poll.isResultPublished ? 'Yes' : 'No'}
                  </div>
                  <button
                    onClick={() => setTestPollId(poll.id)}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Use this poll ID
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 