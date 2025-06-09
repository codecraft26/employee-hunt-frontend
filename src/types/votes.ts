// types/votes.ts

export enum VoteStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export enum VoteType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTI_CHOICE = 'MULTI_CHOICE'
}

export interface VoteOption {
  id: string;
  name: string;
  imageUrl?: string;
  voteCount: number;
}

export interface CreatedBy {
  id: string;
  name: string;
  email: string;
}

export interface Vote {
  id: string;
  title: string;
  description?: string;
  status: VoteStatus;
  type: VoteType;
  startTime: string;
  endTime: string;
  resultDisplayTime?: string;
  isResultPublished: boolean;
  totalVotes: number;
  totalVoters: number;
  createdBy?: CreatedBy | null;
  options: VoteOption[];
  createdAt?: string;
  updatedAt?: string;
  // User-specific fields
  userHasVoted?: boolean;
  userSelectedOptions?: string[];
}

export interface CreateVoteRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  resultDisplayTime?: string;
  type: VoteType;
  options: {
    name: string;
    imageUrl?: string;
  }[];
}

export interface UpdateVoteRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  resultDisplayTime?: string;
  type?: VoteType;
  options?: {
    id?: string; // Include id to update existing option
    name: string;
    imageUrl?: string;
  }[];
}

export interface VoteResponse {
  success: boolean;
  message: string;
  status?: {
    current: string;
    description: string;
  };
  details?: {
    startTime: string;
    endTime: string;
    totalOptions: number;
    type: string;
  };
  data: Vote;
}

export interface VotesListResponse {
  success: boolean;
  data: Vote[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CastVoteRequest {
  voteId: string;
  optionIds: string[]; // Array of option IDs
}

export interface CastVoteResponse {
  success: boolean;
  message: string;
  data: {
    voteId: string;
    selectedOptions: string[];
    timestamp: string;
  };
}

// Additional interfaces for filtering and stats
export interface VoteFilters {
  status?: VoteStatus;
  type?: VoteType;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
}

export interface VoteStats {
  totalVotes: number;
  activeVotes: number;
  upcomingVotes: number;
  completedVotes: number;
  totalParticipants: number;
  averageParticipation: number;
}