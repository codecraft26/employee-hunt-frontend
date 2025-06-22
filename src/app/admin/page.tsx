// pages/admin/AdminDashboard.tsx
'use client';

import React, { useState, useCallback, lazy, useMemo, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTreasureHunts } from '../../hooks/useTreasureHunts';
import { useSearchParams } from 'next/navigation';

import LazyWrapper from '../../components/shared/LazyWrapper';

// Lazy load tab components for better performance
const OverviewTab = lazy(() => import('../../components/tabs/OverviewTab'));
const TreasureHuntsTab = lazy(() => import('../../components/tabs/TreasureHuntsTab'));
const PollsTab = lazy(() => import('../../components/tabs/PollsTab'));
const TeamsTab = lazy(() => import('../../components/tabs/TeamsTab'));
const CategoriesTab = lazy(() => import('../../components/tabs/CategoriesTab'));
const QuizzesTab = lazy(() => import('../../components/tabs/QuizzesTab'));
const ActivitiesTab = lazy(() => import('../../components/tabs/ActivitiesTab'));
const CluesManagementTab = lazy(() => import('../../components/tabs/CluesManagementTab'));
const SubmissionsManagementTab = lazy(() => import('../../components/tabs/SubmissionsManagementTab'));
const WinnerSelectionModal = lazy(() => import('../../components/modals/WinnerSelectionModal'));
const AdminApprovalsTab = lazy(() => import('../../components/tabs/AdminApprovalsTab'));
const PhotoWallTab = lazy(() => import('../../components/tabs/PhotoWallTab'));
const CreateQuizModal = lazy(() => import('../../components/modals/CreateQuizModal'));
const RoomAllotmentTab = lazy(() => import('../../components/tabs/RoomAllotmentTab'));
import UserManagementTab from '../../components/tabs/UserManagementTab';

import { 
  Stats, 
  Team, 
  Quiz, 
  TreasureHunt, 
  PendingApproval, 
  RecentActivity, 
  TabView 
} from '../../types/admin';

// Extended TabView type to include clue, submission management, categories, and photo wall
type ExtendedTabView = TabView | 'clues-management' | 'submissions-management' | 'categories' | 'approve-users' | 'photo-wall' | 'user-management' | 'activities' | 'room-allotment';

// Mock data - In real app, this would come from API calls
const mockStats: Stats = {
  totalTeams: 8,
  totalUsers: 45,
  activeQuizzes: 3,
  activeTreasureHunts: 2,
  activePolls: 4,
  pendingApprovals: 7,
  completedActivities: 23,
  totalPoints: 15420
};

// Keep mock teams for backward compatibility with other components that might need them
const mockTeams: Team[] = [
  { id: 1, name: 'Team Alpha', members: 6, points: 2450, rank: 1, department: 'Engineering' },
  { id: 2, name: 'Team Beta', members: 5, points: 2100, rank: 2, department: 'Design' },
  { id: 3, name: 'Team Gamma', members: 7, points: 1980, rank: 3, department: 'Marketing' },
  { id: 4, name: 'Team Delta', members: 4, points: 1750, rank: 4, department: 'Sales' },
  { id: 5, name: 'Team Omega', members: 6, points: 1650, rank: 5, department: 'HR' },
];

const mockQuizzes: Quiz[] = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics',
    teams: ['Team Alpha', 'Team Beta', 'Team Gamma'],
    questions: 15,
    timeLimit: '30 min',
    status: 'active',
    createdAt: '2024-01-15',
    responses: 12,
    avgScore: 78
  },
  {
    id: 2,
    title: 'React Advanced Concepts',
    description: 'Advanced React patterns and hooks',
    teams: ['Team Alpha', 'Team Delta'],
    questions: 20,
    timeLimit: '45 min',
    status: 'draft',
    createdAt: '2024-01-14',
    responses: 0,
    avgScore: 0
  },
  {
    id: 3,
    title: 'Company Knowledge Quiz',
    description: 'Test your knowledge about our company',
    teams: ['All Teams'],
    questions: 10,
    timeLimit: '20 min',
    status: 'completed',
    createdAt: '2024-01-10',
    responses: 35,
    avgScore: 85
  }
];

const mockPendingApprovals: PendingApproval[] = [
  {
    id: 1,
    type: 'treasure-clue',
    team: 'Team Alpha',
    user: 'John Doe',
    title: 'Kitchen Area Clue',
    description: 'Found the hidden clue near the coffee machine',
    image: '/api/placeholder/200/150',
    submittedAt: '5 min ago',
    clueNumber: 3
  },
  {
    id: 2,
    type: 'treasure-clue',
    team: 'Team Beta',
    user: 'Sarah Smith',
    title: 'Reception Desk Clue',
    description: 'Located the clue behind the reception desk',
    image: '/api/placeholder/200/150',
    submittedAt: '12 min ago',
    clueNumber: 2
  },
  {
    id: 3,
    type: 'quiz-dispute',
    team: 'Team Gamma',
    user: 'Mike Johnson',
    title: 'Question #5 Answer Dispute',
    description: 'Requesting review of JavaScript question answer',
    submittedAt: '1 hour ago'
  }
];

const mockRecentActivities: RecentActivity[] = [
  { id: 1, type: 'quiz', action: 'Quiz "JavaScript Fundamentals" completed by Team Alpha', time: '2 min ago', status: 'completed' },
  { id: 2, type: 'treasure', action: 'New clue submitted by Team Beta', time: '5 min ago', status: 'pending' },
  { id: 3, type: 'poll', action: 'Voting ended for "Best Team Logo"', time: '10 min ago', status: 'completed' },
  { id: 4, type: 'team', action: 'New team "Team Zeta" created', time: '15 min ago', status: 'active' },
  { id: 5, type: 'quiz', action: 'Quiz started by Team Delta', time: '20 min ago', status: 'in-progress' }
];

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<ExtendedTabView>('overview');
  const [selectedTreasureHuntId, setSelectedTreasureHuntId] = useState<string | null>(null);
  const [winnerSelectionModal, setWinnerSelectionModal] = useState<{
    isOpen: boolean;
    huntId: string | null;
  }>({
    isOpen: false,
    huntId: null
  });
  const [quizModal, setQuizModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    quizId?: string;
  }>({
    isOpen: false,
    mode: 'create'
  });

  const { user, logout: handleLogout } = useAuth();
  const treasureHuntsHook = useTreasureHunts();
  const { resetCurrentTreasureHunt, fetchTreasureHuntWithClues } = treasureHuntsHook;
  const searchParams = useSearchParams();

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'quizzes', 'treasure-hunts', 'polls', 'teams', 'categories', 'photo-wall', 'user-management', 'activities', 'approve-users', 'room-allotment'].includes(tabParam)) {
      setActiveView(tabParam as ExtendedTabView);
    }
  }, [searchParams]);

  // Handler functions for API calls - These will be implemented when connecting to backend
  const handleQuickAction = useCallback((type: string) => {
    // Navigate to appropriate tab based on quick action
    switch (type) {
      case 'quiz':
      case 'create-quiz':
        setActiveView('quizzes');
        break;
      case 'treasure':
      case 'create-hunt':
        setActiveView('treasure-hunts');
        break;
      case 'poll':
      case 'create-poll':
        setActiveView('polls');
        break;
      case 'team':
      case 'create-team':
        setActiveView('teams');
        break;
      case 'create-category': // NEW CASE
        setActiveView('categories');
        break;
      case 'room-allotment':
      case 'assign-room':
        setActiveView('room-allotment');
        break;
      case 'view-approvals':
        setActiveView('approvals');
        break;
      case 'approve-user':
        setActiveView('approve-users');
        break;
      case 'photo-wall':
        setActiveView('photo-wall');
        break;
      case 'activity':
      case 'create-activity':
        setActiveView('activities');
        break;
      case 'user-management':
        setActiveView('user-management');
        break;
      
      default:
        // Unhandled quick action
        break;
    }
  }, [setActiveView]);

  // Quiz handlers
  const handleCreateQuiz = useCallback(() => {
    console.log('handleCreateQuiz called - opening modal');
    setQuizModal({
      isOpen: true,
      mode: 'create'
    });
  }, []);

  const handleViewQuiz = useCallback((quizId: string) => {
    // TODO: Navigate to quiz details
  }, []);

  const handleEditQuiz = useCallback((quizId: string) => {
    setQuizModal({
      isOpen: true,
      mode: 'edit',
      quizId: quizId
    });
  }, []);

  const handleQuizModalClose = useCallback(() => {
    setQuizModal({
      isOpen: false,
      mode: 'create'
    });
  }, []);

  const handleQuizModalSuccess = useCallback(() => {
    setQuizModal({
      isOpen: false,
      mode: 'create'
    });
    // Optionally refresh quiz data or show success message
  }, []);

  // Treasure hunt handlers
  const handleViewClues = useCallback(async (huntId: string) => {
    setSelectedTreasureHuntId(huntId);
    setActiveView('clues-management');
    
    try {
      await fetchTreasureHuntWithClues(huntId);
    } catch (error) {
      // Failed to fetch treasure hunt with clues
    }
  }, [fetchTreasureHuntWithClues]);

  const handleViewSubmissions = useCallback(async (huntId: string) => {
    setSelectedTreasureHuntId(huntId);
    setActiveView('submissions-management');
    
    // The SubmissionsManagementTab will handle fetching submissions
  }, []);

  const handleDeclareWinner = useCallback((huntId: string) => {
    setWinnerSelectionModal({
      isOpen: true,
      huntId: huntId
    });
  }, []);

  const handleWinnerSelectionClose = useCallback(() => {
    setWinnerSelectionModal({
      isOpen: false,
      huntId: null
    });
    if (resetCurrentTreasureHunt && typeof resetCurrentTreasureHunt === 'function') {
      resetCurrentTreasureHunt();
    } else {
      // ⚠️ resetCurrentTreasureHunt function is not available
    }
  }, [resetCurrentTreasureHunt]);

  const handleWinnerSelectionSuccess = useCallback(() => {
    // Optionally show a success message or refresh data
  }, []);

  // Navigation back from clues/submissions management
  const handleBackFromManagement = useCallback(() => {
    setActiveView('treasure-hunts');
    setSelectedTreasureHuntId(null);
    if (resetCurrentTreasureHunt && typeof resetCurrentTreasureHunt === 'function') {
      resetCurrentTreasureHunt();
    } else {
      // ⚠️ resetCurrentTreasureHunt function is not available
    }
  }, [resetCurrentTreasureHunt]);

  // Poll handlers
  const handleCreatePoll = () => {
    // This is now handled within the PollsTab component
  };

  const handleViewResults = (pollId: string) => {
    // TODO: Navigate to poll results page or open modal
  };

  const handleNotifyWinner = (pollId: string) => {
    // TODO: API call to notify users about poll results
  };

  // Team handlers - now handled by the TeamsTab component itself
  const handleCreateTeam = () => {
    // This is now handled within the TeamsTab component
  };

  const handleImportUsers = () => {
    // TODO: Handle user import - could open a modal or navigate to import page
  };

  const handleManageMembers = (teamId: string) => {
    // This is now handled within the TeamsTab component
  };

  const handleViewStats = (teamId: string) => {
    // This is now handled within the TeamsTab component
  };

  // NEW: Category handlers - handled by the CategoriesTab component itself
  const handleCreateCategory = () => {
    // This is now handled within the CategoriesTab component
  };

  const handleViewCategoryStats = (categoryId: string) => {
    // This is now handled within the CategoriesTab component
  };

  // Approval handlers
  const handleApprove = (approvalId: number) => {
    // TODO: API call to approve
  };

  const handleReject = (approvalId: number) => {
    // TODO: API call to reject
  };

  const handleAddFeedback = (approvalId: number) => {
    // TODO: Open feedback modal
  };

  const renderActiveTab = () => {
    switch (activeView) {
      case 'overview':
        return (
          <LazyWrapper>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => handleQuickAction('approve-user')}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Admin Approvals</h3>
                      <p className="mt-1 text-sm text-gray-500">Manage admin access requests</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
              <OverviewTab
                onQuickAction={handleQuickAction}
              />
            </div>
          </LazyWrapper>
        );
      case 'quizzes':
        return (
          <LazyWrapper>
            <QuizzesTab
              onCreateQuiz={handleCreateQuiz}
              onViewQuiz={handleViewQuiz}
              onEditQuiz={handleEditQuiz}
            />
          </LazyWrapper>
        );
      case 'treasure-hunts':
        return (
          <LazyWrapper>
            <TreasureHuntsTab
              onViewClues={handleViewClues}
              onViewSubmissions={handleViewSubmissions}
              onDeclareWinner={handleDeclareWinner}
            />
          </LazyWrapper>
        );
      case 'clues-management':
        return (
          <LazyWrapper>
            {selectedTreasureHuntId ? (
              <CluesManagementTab
                treasureHuntId={selectedTreasureHuntId}
                onBack={handleBackFromManagement}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No treasure hunt selected</p>
              </div>
            )}
          </LazyWrapper>
        );
      case 'submissions-management':
        return (
          <LazyWrapper>
            {selectedTreasureHuntId ? (
              <SubmissionsManagementTab
                treasureHuntId={selectedTreasureHuntId}
                onBack={handleBackFromManagement}
                onDeclareWinner={handleDeclareWinner}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No treasure hunt selected</p>
              </div>
            )}
          </LazyWrapper>
        );
      case 'polls':
        return (
          <LazyWrapper>
            <PollsTab
              onViewResults={handleViewResults}
              onNotifyWinner={handleNotifyWinner}
            />
          </LazyWrapper>
        );
      case 'teams':
        return (
          <LazyWrapper>
            <TeamsTab
              onCreateTeam={handleCreateTeam}
              onImportUsers={handleImportUsers}
              onManageMembers={handleManageMembers}
              onViewStats={handleViewStats}
            />
          </LazyWrapper>
        );
      case 'categories': // NEW CASE
        return (
          <LazyWrapper>
            <CategoriesTab
              onCreateCategory={handleCreateCategory}
              onViewStats={handleViewCategoryStats}
            />
          </LazyWrapper>
        );

      case 'activities':
        return (
          <LazyWrapper>
            <ActivitiesTab />
          </LazyWrapper>
        );

      case 'approve-users':
        return (
          <LazyWrapper>
            <AdminApprovalsTab />
          </LazyWrapper>
        );
      
      case 'photo-wall':
        return (
          <LazyWrapper>
            <PhotoWallTab />
          </LazyWrapper>
        );

      case 'user-management':
        return (
          <UserManagementTab />
        );
     
      case 'room-allotment':
        return (
          <LazyWrapper>
            <RoomAllotmentTab />
          </LazyWrapper>
        );
     
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tab Not Found</h3>
            <p className="text-gray-500">The requested tab does not exist.</p>
          </div>
        );
    }
  };

  return (
    <>
      {/* Breadcrumb for management views */}
      {(activeView === 'clues-management' || activeView === 'submissions-management') && (
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-4">
              <li>
                <div>
                  <button
                    onClick={() => setActiveView('treasure-hunts')}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    Treasure Hunts
                  </button>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">
                    {activeView === 'clues-management' ? 'Manage Clues' : 'View Submissions'}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      )}
      
      {renderActiveTab()}

      {/* Winner Selection Modal */}
      <LazyWrapper>
        <WinnerSelectionModal
          isOpen={winnerSelectionModal.isOpen}
          treasureHuntId={winnerSelectionModal.huntId || ''}
          onClose={handleWinnerSelectionClose}
          onSuccess={handleWinnerSelectionSuccess}
        />
      </LazyWrapper>

      {/* Create/Edit Quiz Modal */}
      <LazyWrapper>
        <CreateQuizModal
          isOpen={quizModal.isOpen}
          onClose={handleQuizModalClose}
          onSuccess={handleQuizModalSuccess}
        />
      </LazyWrapper>
    </>
  );
}