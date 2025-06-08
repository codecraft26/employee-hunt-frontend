import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export interface DashboardStats {
  totalTeams: number;
  totalUsers: number;
  activeQuizzes: number;
  activeTreasureHunts: number;
  activePolls: number;
  pendingApprovals: number;
  completedActivities: number;
  totalPoints: number;
}

export interface Team {
  id: string;
  name: string;
  members: number;
  points: number;
  rank: number;
  department: string;
}

export interface Vote {
  id: string;
  title: string;
  description: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  startTime: string;
  endTime: string;
  resultDisplayTime: string;
  isResultPublished: boolean;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  options: VoteOption[];
  totalVotes?: number;
}

export interface VoteOption {
  id: string;
  name: string;
  imageUrl?: string;
  voteCount: number;
}

export interface PendingApproval {
  id: string;
  type: 'treasure-clue' | 'quiz-dispute';
  team: string;
  user: string;
  title: string;
  description: string;
  image?: string;
  submittedAt: string;
  clueNumber?: number;
}

export interface Activity {
  id: string;
  type: string;
  action: string;
  time: string;
  status: string;
}

export const useAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTeams: 0,
    totalUsers: 0,
    activeQuizzes: 0,
    activeTreasureHunts: 0,
    activePolls: 0,
    pendingApprovals: 0,
    completedActivities: 0,
    totalPoints: 0
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeVotes, setActiveVotes] = useState<Vote[]>([]);
  const [upcomingVotes, setUpcomingVotes] = useState<Vote[]>([]);
  const [completedVotes, setCompletedVotes] = useState<Vote[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from your backend
      const [
        statsData,
        teamsData,
        activeVotesData,
        upcomingVotesData,
        completedVotesData,
        approvalsData,
        activitiesData
      ] = await Promise.all([
        apiService.getDashboardStats().catch(() => ({
          totalTeams: 0,
          totalUsers: 0,
          activeQuizzes: 0,
          activeTreasureHunts: 0,
          activePolls: 0,
          pendingApprovals: 0,
          completedActivities: 0,
          totalPoints: 0
        })),
        apiService.getTeams().catch(() => []),
        apiService.getActiveVotes().catch(() => []),
        apiService.getUpcomingVotes().catch(() => []),
        apiService.getCompletedVotes().catch(() => []),
        apiService.getPendingApprovals().catch(() => []),
        apiService.getRecentActivities().catch(() => [])
      ]);

      setStats(statsData);
      setTeams(teamsData);
      setActiveVotes(activeVotesData);
      setUpcomingVotes(upcomingVotesData);
      setCompletedVotes(completedVotesData);
      setPendingApprovals(approvalsData);
      setRecentActivities(activitiesData);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshData = () => {
    fetchDashboardData();
  };

  const handleApproval = async (id: string, action: 'approve' | 'reject') => {
    try {
      await apiService.approveItem(id, action);
      // Refresh data after approval
      refreshData();
      return true;
    } catch (error) {
      console.error(`Error ${action}ing item:`, error);
      return false;
    }
  };

  const createVote = async (voteData: any) => {
    try {
      const result = await apiService.createVote(voteData);
      refreshData(); // Refresh data after creation
      return result;
    } catch (error) {
      console.error('Error creating vote:', error);
      throw error;
    }
  };

  return {
    loading,
    error,
    stats,
    teams,
    votes: {
      active: activeVotes,
      upcoming: upcomingVotes,
      completed: completedVotes,
      all: [...activeVotes, ...upcomingVotes, ...completedVotes]
    },
    pendingApprovals,
    recentActivities,
    refreshData,
    handleApproval,
    createVote
  };
};