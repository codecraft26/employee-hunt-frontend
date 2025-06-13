// types/admin.ts
export interface Stats {
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
  id: number;
  name: string;
  members: number;
  points: number;
  rank: number;
  department: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  teams: string[];
  questions: number;
  timeLimit: string;
  status: 'active' | 'draft' | 'completed';
  createdAt: string;
  responses: number;
  avgScore: number;
}

export interface TreasureHunt {
  id: number;
  title: string;
  description: string;
  teams: string[];
  totalClues: number;
  status: 'active' | 'planning' | 'completed';
  startDate: string;
  endDate: string;
  progress: Record<string, number>;
}

// Removed Poll interface - now using Vote interface from types/votes.ts

export interface PendingApproval {
  id: number;
  type: 'treasure-clue' | 'quiz-dispute';
  team: string;
  user: string;
  title: string;
  description: string;
  image?: string;
  submittedAt: string;
  clueNumber?: number;
}

export interface RecentActivity {
  id: number;
  type: 'quiz' | 'treasure' | 'poll' | 'team';
  action: string;
  time: string;
  status: 'active' | 'completed' | 'pending' | 'in-progress';
}

export interface QuickAction {
  title: string;
  icon: any;
  color: string;
  type: 'quiz' | 'treasure' | 'poll' | 'team' | 'create-quiz' | 'create-hunt' | 'create-poll' | 'create-team' | 'create-category';
}

export type TabView = 'overview' | 'quizzes' | 'treasure-hunts' | 'polls' | 'teams' | 'approvals';