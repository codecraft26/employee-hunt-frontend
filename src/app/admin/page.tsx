// pages/admin/AdminDashboard.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTreasureHunts } from '../../hooks/useTreasureHunts';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminNavigation from '../../components/admin/AdminNavigation';
import OverviewTab from '../../components/tabs/OverviewTab';
import TreasureHuntsTab from '../../components/tabs/TreasureHuntsTab';
import PollsTab from '../../components/tabs/PollsTab';
import TeamsTab from '../../components/tabs/TeamsTab';
import CategoriesTab from '../../components/tabs/CategoriesTab'; // NEW IMPORT
import QuizzesTab from '../../components/tabs/QuizzesTab';
import CluesManagementTab from '../../components/tabs/CluesManagementTab';
import SubmissionsManagementTab from '../../components/tabs/SubmissionsManagementTab';
import WinnerSelectionModal from '../../components/modals/WinnerSelectionModal';
import { 
  Stats, 
  Team, 
  Quiz, 
  TreasureHunt, 
  PendingApproval, 
  RecentActivity, 
  TabView 
} from '../../types/admin';

// Extended TabView type to include clue, submission management, and categories
type ExtendedTabView = TabView | 'clues-management' | 'submissions-management' | 'categories';

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

  const { user, logout: handleLogout } = useAuth();
  const { resetCurrentTreasureHunt, fetchTreasureHuntWithClues } = useTreasureHunts();

  // Handler functions for API calls - These will be implemented when connecting to backend
  const handleQuickAction = (type: string) => {
    console.log(`Quick action: ${type}`);
    
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
      case 'view-approvals':
        setActiveView('approvals');
        break;
      default:
        console.log(`Unhandled quick action: ${type}`);
    }
  };

  // Quiz handlers
  const handleCreateQuiz = () => {
    console.log('Create quiz');
    // TODO: API call to create quiz
  };

  const handleViewQuiz = (quizId: string) => {
    console.log(`View quiz: ${quizId}`);
    // TODO: Navigate to quiz details
  };

  const handleEditQuiz = (quizId: string) => {
    console.log(`Edit quiz: ${quizId}`);
    // TODO: Navigate to quiz edit form
  };

  // Treasure hunt handlers
  const handleViewClues = async (huntId: string) => {
    console.log(`View clues: ${huntId}`);
    setSelectedTreasureHuntId(huntId);
    setActiveView('clues-management');
    
    // Fetch the treasure hunt with clues data
    try {
      await fetchTreasureHuntWithClues(huntId);
    } catch (error) {
      console.error('Failed to fetch treasure hunt with clues:', error);
    }
  };

  const handleViewSubmissions = async (huntId: string) => {
    console.log(`View submissions: ${huntId}`);
    setSelectedTreasureHuntId(huntId);
    setActiveView('submissions-management');
    
    // The SubmissionsManagementTab will handle fetching submissions
  };

  const handleDeclareWinner = (huntId: string) => {
    console.log(`Declare winner: ${huntId}`);
    setWinnerSelectionModal({
      isOpen: true,
      huntId: huntId
    });
  };

  const handleWinnerSelectionClose = () => {
    setWinnerSelectionModal({
      isOpen: false,
      huntId: null
    });
    resetCurrentTreasureHunt();
  };

  const handleWinnerSelectionSuccess = () => {
    console.log('Winner declared successfully');
    // Optionally show a success message or refresh data
  };

  // Navigation back from clues/submissions management
  const handleBackFromManagement = () => {
    setActiveView('treasure-hunts');
    setSelectedTreasureHuntId(null);
    resetCurrentTreasureHunt();
  };

  // Poll handlers
  const handleCreatePoll = () => {
    console.log('Create poll - handled by PollsTab component');
    // This is now handled within the PollsTab component
  };

  const handleViewResults = (pollId: string) => {
    console.log(`View results: ${pollId}`);
    // TODO: Navigate to poll results page or open modal
  };

  const handleNotifyWinner = (pollId: string) => {
    console.log(`Notify users about poll results: ${pollId}`);
    // TODO: API call to notify users about poll results
  };

  // Team handlers - now handled by the TeamsTab component itself
  const handleCreateTeam = () => {
    console.log('Create team - handled by TeamsTab component');
    // This is now handled within the TeamsTab component
  };

  const handleImportUsers = () => {
    console.log('Import users');
    // TODO: Handle user import - could open a modal or navigate to import page
  };

  const handleManageMembers = (teamId: string) => {
    console.log(`Manage members for team: ${teamId}`);
    // This is now handled within the TeamsTab component
  };

  const handleViewStats = (teamId: string) => {
    console.log(`View stats for team: ${teamId}`);
    // This is now handled within the TeamsTab component
  };

  // NEW: Category handlers - handled by the CategoriesTab component itself
  const handleCreateCategory = () => {
    console.log('Create category - handled by CategoriesTab component');
    // This is now handled within the CategoriesTab component
  };

  const handleViewCategoryStats = (categoryId: string) => {
    console.log(`View stats for category: ${categoryId}`);
    // This is now handled within the CategoriesTab component
  };

  // Approval handlers
  const handleApprove = (approvalId: number) => {
    console.log(`Approve: ${approvalId}`);
    // TODO: API call to approve
  };

  const handleReject = (approvalId: number) => {
    console.log(`Reject: ${approvalId}`);
    // TODO: API call to reject
  };

  const handleAddFeedback = (approvalId: number) => {
    console.log(`Add feedback: ${approvalId}`);
    // TODO: Open feedback modal
  };

  const renderActiveTab = () => {
    switch (activeView) {
      case 'overview':
        return (
          <OverviewTab
            stats={mockStats}
          />
        );
      case 'quizzes':
        return (
          <QuizzesTab
            onCreateQuiz={handleCreateQuiz}
            onViewQuiz={handleViewQuiz}
            onEditQuiz={handleEditQuiz}
          />
        );
      case 'treasure-hunts':
        return (
          <TreasureHuntsTab
            onViewClues={handleViewClues}
            onViewSubmissions={handleViewSubmissions}
            onDeclareWinner={handleDeclareWinner}
          />
        );
      case 'clues-management':
        return (
          <CluesManagementTab
            treasureHuntId={selectedTreasureHuntId}
            onBack={handleBackFromManagement}
          />
        );
      case 'submissions-management':
        return (
          <SubmissionsManagementTab
            treasureHuntId={selectedTreasureHuntId}
            onBack={handleBackFromManagement}
          />
        );
      case 'polls':
        return (
          <PollsTab
            onViewResults={handleViewResults}
            onNotifyWinner={handleNotifyWinner}
          />
        );
      case 'teams':
        return (
          <TeamsTab
            onCreateTeam={handleCreateTeam}
            onImportUsers={handleImportUsers}
            onManageMembers={handleManageMembers}
            onViewStats={handleViewStats}
          />
        );
      case 'categories': // NEW CASE
        return (
          <CategoriesTab
            onCreateCategory={handleCreateCategory}
            onViewStats={handleViewCategoryStats}
          />
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
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        pendingApprovals={mockStats.pendingApprovals}
        onLogout={handleLogout}
        userName={user?.name || user?.email || 'Admin'}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OverviewTab
          stats={mockStats}
        />
      </div>

      {/* Winner Selection Modal */}
      <WinnerSelectionModal
        isOpen={winnerSelectionModal.isOpen}
        huntId={winnerSelectionModal.huntId}
        onClose={handleWinnerSelectionClose}
        onSuccess={handleWinnerSelectionSuccess}
      />
    </div>
  );
}