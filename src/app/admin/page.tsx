'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminNavigation from '../../components/admin/AdminNavigation';
import OverviewTab from '../../components/tabs/OverviewTab';

import TreasureHuntsTab from '../../components/tabs/TreasureHuntsTab';
import PollsTab from '../../components/tabs/PollsTab';
import TeamsTab from '../../components/tabs/TeamsTab'; // Updated TeamsTab
import QuizzesTab from '../../components/tabs/QuizzesTab'; // Updated QuizzesTab
import ApprovalsTab from '../../components/tabs/ApprovalsTab';
import { 
  Stats, 
  Team, 
  Quiz, 
  TreasureHunt, 
  PendingApproval, 
  RecentActivity, 
  TabView 
} from '../../types/admin';

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

const mockTreasureHunts: TreasureHunt[] = [
  {
    id: 1,
    title: 'Office Explorer Challenge',
    description: 'Find all the hidden clues around the office',
    teams: ['Team Alpha', 'Team Beta'],
    totalClues: 8,
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    progress: {
      'Team Alpha': 6,
      'Team Beta': 4
    }
  },
  {
    id: 2,
    title: 'City Adventure Hunt',
    description: 'Explore the city and complete challenges',
    teams: ['Team Gamma', 'Team Delta', 'Team Omega'],
    totalClues: 12,
    status: 'planning',
    startDate: '2024-01-25',
    endDate: '2024-01-30',
    progress: {}
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
  const [activeView, setActiveView] = useState<TabView>('overview');
  const { user, logout: handleLogout } = useAuth();

  // Handler functions for API calls - These will be implemented when connecting to backend
  const handleQuickAction = (type: string) => {
    console.log(`Quick action: ${type}`);
    // TODO: Navigate to create modal or form
  };

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

  const handleCreateHunt = () => {
    console.log('Create treasure hunt');
    // TODO: API call to create treasure hunt
  };

  const handleViewClues = (huntId: number) => {
    console.log(`View clues: ${huntId}`);
    // TODO: Navigate to clues management
  };

  const handleDeclareWinner = (huntId: number) => {
    console.log(`Declare winner: ${huntId}`);
    // TODO: API call to declare winner
  };

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

  // Updated team handlers - now handled by the TeamsTab component itself
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
            teams={mockTeams}
            recentActivities={mockRecentActivities}
            onQuickAction={handleQuickAction}
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
            treasureHunts={mockTreasureHunts}
            onCreateHunt={handleCreateHunt}
            onViewClues={handleViewClues}
            onDeclareWinner={handleDeclareWinner}
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
      case 'approvals':
        return (
          <ApprovalsTab
            pendingApprovals={mockPendingApprovals}
            onApprove={handleApprove}
            onReject={handleReject}
            onAddFeedback={handleAddFeedback}
          />
        );
      default:
        return null;
    }
  };

  return (
      <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        pendingApprovals={mockStats.pendingApprovals}
        onLogout={handleLogout}
        userName={user?.name || user?.email || 'Admin'}
      />
      <AdminNavigation
        activeView={activeView}
        onViewChange={setActiveView}
        pendingApprovals={mockStats.pendingApprovals}
      />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveTab()}
      </div>
    </div>
  );
}