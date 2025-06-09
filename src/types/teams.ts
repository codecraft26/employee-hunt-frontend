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
}

export interface Team {
  id: string;
  name: string;
  description: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
}

export interface CreateTeamRequest {
  name: string;
  description: string;
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

export interface TeamResponse {
  success: boolean;
  data: Team;
}

export interface TeamsResponse {
  success: boolean;
  data: Team[];
} 