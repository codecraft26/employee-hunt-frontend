export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  employeeCode?: string | null;
  gender?: string | null;
  profileImage?: string | null;
  department?: string | null;
  hobbies?: string[] | null;
  createdAt: string;
  updatedAt: string;
  isLeader?: boolean;
}

export interface TeamLeader {
  id: string;
  name: string;
  email: string;
  role?: string;
  profileImage?: string | null;
  department?: string | null;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  score: number;
  leader?: TeamLeader | null;
  leaderId?: string | null;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
}

export interface CreateTeamRequest {
  name: string;
  description: string;
  leaderId?: string;
  memberIds?: string[];
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
}

export interface AddMemberRequest {
  teamId: string;
  userId: string;
}

export interface RemoveMemberRequest {
  teamId: string;
  userId: string;
}

export interface AssignLeaderRequest {
  teamId: string;
  leaderId: string;
}

export interface CreateTeamWithMembersRequest {
  name: string;
  description: string;
  leaderId: string;
  memberIds: string[];
}

export interface TeamResponse {
  success: boolean;
  data: Team;
}

export interface TeamsResponse {
  success: boolean;
  data: Team[];
}

// Member Submission Types for Enhanced Treasure Hunt
export interface TeamMemberSubmission {
  id: string;
  imageUrl: string;
  description: string;
  status: 'PENDING' | 'APPROVED_BY_LEADER' | 'REJECTED_BY_LEADER' | 'SENT_TO_ADMIN';
  leaderNotes?: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
  };
  reviewedBy?: {
    id: string;
    name: string;
  };
  clueId: string;
  teamId: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface TeamClueSubmission {
  id: string;
  imageUrl: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  leaderNotes?: string;
  adminFeedback?: string;
  submittedBy: {
    id: string;
    name: string;
  };
  team?: {
    id: string;
    name: string;
  };
  approvedBy?: {
    id: string;
    name: string;
  };
  selectedSubmissionIds: string[];
  selectedSubmissions?: TeamMemberSubmission[]; // The actual member submissions that were selected
  clueId: string;
  teamId: string;
  treasureHuntId: string;
  createdAt: string;
  approvedAt?: string;
}

export interface SubmitMemberClueRequest {
  teamId: string;
  description: string;
  image: File;
}

export interface ApproveSubmissionRequest {
  submissionId: string;
  leaderNotes?: string;
}

export interface RejectSubmissionRequest {
  submissionId: string;
  leaderNotes?: string;
}

export interface MemberSubmissionsResponse {
  success: boolean;
  message?: string;
  data: TeamMemberSubmission[];
}

export interface TeamClueSubmissionEnhanced extends TeamClueSubmission {
  imageUrls?: string[]; // Alternative array of image URLs
  selectedSubmissions?: TeamMemberSubmission[]; // Full member submission details
}

export interface TeamSubmissionsResponse {
  success: boolean;
  message?: string;
  data: TeamClueSubmission[];
} 