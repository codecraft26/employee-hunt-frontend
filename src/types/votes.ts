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

// Enhanced enum for voting option types
export enum VotingOptionType {
  USER_SPECIFIC = 'USER_SPECIFIC',           // Admin manually selects users as voting options
  CATEGORY_BASED = 'CATEGORY_BASED',         // Legacy: Custom text options (kept for backward compatibility)
  CUSTOM_OPTIONS = 'CUSTOM_OPTIONS',         // Admin writes custom text options  
  CATEGORY_USER_BASED = 'CATEGORY_USER_BASED' // Auto-selected users from categories become voting options
}

export interface VoteOption {
  id: string;
  name: string;
  imageUrl?: string;
  voteCount: number;
  // For user-specific options
  targetUser?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    employeeCode?: string;
    department?: string;
  };
}

export interface CreatedBy {
  id: string;
  name: string;
  email: string;
}

// Interface for available users when creating polls
export interface AvailableUser {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  employeeCode?: string;
  department?: string;
  categories?: Array<{
    id: string;
    name: string;
  }>;
}

// Interface for category-user preview
export interface CategoryUserPreview {
  totalUsers: number;
  categories: string[];
  canCreatePoll: boolean;
}

// Request interface for previewing users by categories
export interface UsersByCategoriesRequest {
  categoryIds: string[];
}

// Response interface for users by categories preview
export interface UsersByCategoriesResponse {
  success: boolean;
  message: string;
  preview: CategoryUserPreview;
  data: AvailableUser[];
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
  // Category fields
  categoryType: 'ALL' | 'SPECIFIC';
  allowedCategories?: Array<{
    id: string;
    name: string;
  }>;
  // New voting option type
  votingOptionType: VotingOptionType;
  // For category-user-based polls
  optionCategories?: Array<{
    id: string;
    name: string;
  }>;
}

// User option for creating user-specific polls
export interface UserVoteOption {
  userId: string;
  name?: string; // Optional custom display name
}

export interface CreateVoteRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  resultDisplayTime?: string;
  type: VoteType;
  categoryType: 'ALL' | 'SPECIFIC';
  allowedCategories?: string[]; // Array of category IDs
  // New fields for enhanced poll creation
  votingOptionType: VotingOptionType;
  // For category-based polls (existing behavior)
  options?: {
    name: string;
    imageUrl?: string;
  }[];
  // For user-specific polls (manual selection)
  userOptions?: UserVoteOption[];
  // For category-user-based polls (automatic from categories)
  optionCategories?: string[]; // Array of category IDs
}

export interface UpdateVoteRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  resultDisplayTime?: string;
  type?: VoteType;
  votingOptionType?: VotingOptionType;
  // For category-based polls
  options?: {
    id?: string; // Include id to update existing option
    name: string;
    imageUrl?: string;
  }[];
  // For user-specific polls
  userOptions?: UserVoteOption[];
  // For category-user-based polls
  optionCategories?: string[];
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
    resultDisplayTime?: string;
    votingOptionType: string;
    optionsCount: number;
    optionsWithImages: number;
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

// New response for available users
export interface AvailableUsersResponse {
  success: boolean;
  message: string;
  data: AvailableUser[];
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