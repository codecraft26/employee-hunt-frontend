'use client';

import React, { useState } from 'react';
import { useTeams } from '../../hooks/useTeams';
import { useToast } from '../shared/ToastContainer';
import { Bug, Play, X, Bell } from 'lucide-react';

const TeamDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testTeamId, setTestTeamId] = useState('');
  const [testUserId, setTestUserId] = useState('');
  const [debugOutput, setDebugOutput] = useState<string[]>([]);
  const { teams, users, removeMemberFromTeam, loading, error } = useTeams();
  const { showSuccess, showError, showInfo } = useToast();

  const addLog = (message: string) => {
    setDebugOutput(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testRemoveMember = async () => {
    if (!testTeamId || !testUserId) {
      addLog('❌ Please enter both Team ID and User ID');
      return;
    }

    addLog('🧪 Starting team member removal test...');
    addLog(`Team ID: ${testTeamId}`);
    addLog(`User ID: ${testUserId}`);

    try {
      addLog('📡 Calling removeMemberFromTeam...');
      const result = await removeMemberFromTeam(testTeamId, testUserId);
      
      if (result) {
        addLog('✅ Member removal successful!');
      } else {
        addLog('❌ Member removal failed (returned false)');
      }
    } catch (err: any) {
      addLog(`❌ Member removal error: ${err.message}`);
    }

    if (error) {
      addLog(`🔍 Hook error state: ${error}`);
    }
  };

  const clearLogs = () => {
    setDebugOutput([]);
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      {/* Debug toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-orange-500 text-white text-xs px-3 py-2 rounded opacity-70 hover:opacity-100 flex items-center space-x-1"
      >
        <Bug className="h-4 w-4" />
        <span>Team Debug</span>
      </button>

      {/* Debug panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Team Member Removal Debug</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Current State */}
              <div>
                <h4 className="font-medium mb-2">Current State</h4>
                <div className="text-sm bg-gray-100 p-3 rounded">
                  <p><strong>Teams Count:</strong> {teams.length}</p>
                  <p><strong>Users Count:</strong> {users.length}</p>
                  <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                  <p><strong>Error:</strong> {error || 'None'}</p>
                </div>
              </div>

              {/* Test Section */}
              <div>
                <h4 className="font-medium mb-2">Test Member Removal</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Team ID</label>
                    <input
                      type="text"
                      value={testTeamId}
                      onChange={(e) => setTestTeamId(e.target.value)}
                      placeholder="Enter team ID"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <input
                      type="text"
                      value={testUserId}
                      onChange={(e) => setTestUserId(e.target.value)}
                      placeholder="Enter user ID"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={testRemoveMember}
                      disabled={loading}
                      className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                    >
                      <Play className="h-4 w-4" />
                      <span>Test Remove</span>
                    </button>
                    
                    <button
                      onClick={clearLogs}
                      className="bg-gray-500 text-white px-3 py-2 rounded text-sm"
                    >
                      Clear Logs
                    </button>
                    
                    <button
                      onClick={() => showInfo('Test Toast', 'This is a test notification from the debug panel')}
                      className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-2 rounded text-sm"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Test Toast</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Teams List */}
              <div>
                <h4 className="font-medium mb-2">Available Teams</h4>
                <div className="max-h-32 overflow-y-auto text-sm bg-gray-50 p-2 rounded">
                  {teams.map(team => (
                    <div key={team.id} className="mb-2 p-2 bg-white rounded border">
                      <div><strong>ID:</strong> {team.id}</div>
                      <div><strong>Name:</strong> {team.name}</div>
                      <div><strong>Members:</strong> {team.members.length}</div>
                      {team.members.map(member => (
                        <div key={member.id} className="ml-4 text-xs text-gray-600">
                          • {member.name} (ID: {member.id})
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Debug Output */}
              <div>
                <h4 className="font-medium mb-2">Debug Log</h4>
                <div className="max-h-40 overflow-y-auto text-xs bg-gray-900 text-green-400 p-3 rounded font-mono">
                  {debugOutput.length === 0 ? (
                    <div className="text-gray-500">No logs yet...</div>
                  ) : (
                    debugOutput.map((log, index) => (
                      <div key={index}>{log}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamDebugPanel; 