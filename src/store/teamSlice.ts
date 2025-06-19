import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: User[];
}

export interface TreasureHuntClue {
  id: string;
  clueNumber: number;
  imageUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminFeedback?: string;
  submittedBy: User;
  approvedBy?: User;
}

export interface TreasureHunt {
  id: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED';
  team: Team;
  clues: TreasureHuntClue[];
}

export interface TeamState {
  teams: Team[];
  users: User[];
  treasureHunts: TreasureHunt[];
  selectedTeam: Team | null;
  selectedTreasureHunt: TreasureHunt | null;
  clues: TreasureHuntClue[];
  isLoading: boolean;
  error: string | null;
}

interface CreateTeamData {
  name: string;
  description?: string;
}

interface AddMemberData {
  teamId: string;
  userId: string;
}

interface CreateTreasureHuntData {
  teamId: string;
  title: string;
  description: string;
}

interface SubmitClueData {
  treasureHuntId: string;
  imageUrl: string;
}

interface ApproveRejectClueData {
  clueId: string;
  feedback?: string;
}

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://:3001/api';

// Configure axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Async thunks
export const createTeam = createAsyncThunk(
  'team/createTeam',
  async (teamData: CreateTeamData, { rejectWithValue }) => {
    try {
      const response = await api.post('/teams', teamData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create team');
    }
  }
);

export const addMemberToTeam = createAsyncThunk(
  'team/addMemberToTeam',
  async (memberData: AddMemberData, { rejectWithValue }) => {
    try {
      const response = await api.post('/teams/members', memberData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add member');
    }
  }
);

export const createTreasureHunt = createAsyncThunk(
  'team/createTreasureHunt',
  async (huntData: CreateTreasureHuntData, { rejectWithValue }) => {
    try {
      const { teamId, ...data } = huntData;
      const response = await api.post(`/teams/${teamId}/treasure-hunts`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create treasure hunt');
    }
  }
);

export const submitClue = createAsyncThunk(
  'team/submitClue',
  async (clueData: SubmitClueData, { rejectWithValue }) => {
    try {
      const { treasureHuntId, ...data } = clueData;
      const response = await api.post(`/teams/treasure-hunts/${treasureHuntId}/clues`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit clue');
    }
  }
);

export const approveClue = createAsyncThunk(
  'team/approveClue',
  async (data: ApproveRejectClueData, { rejectWithValue }) => {
    try {
      const { clueId, feedback } = data;
      const response = await api.post(`/teams/treasure-hunts/clues/${clueId}/approve`, { feedback });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve clue');
    }
  }
);

export const rejectClue = createAsyncThunk(
  'team/rejectClue',
  async (data: ApproveRejectClueData, { rejectWithValue }) => {
    try {
      const { clueId, feedback } = data;
      const response = await api.post(`/teams/treasure-hunts/clues/${clueId}/reject`, { feedback });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject clue');
    }
  }
);

export const getAllTeams = createAsyncThunk(
  'team/getAllTeams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teams');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teams');
    }
  }
);

export const getAllUsers = createAsyncThunk(
  'team/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teams/users');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const getTeamTreasureHunts = createAsyncThunk(
  'team/getTeamTreasureHunts',
  async (teamId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teams/${teamId}/treasure-hunts`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch treasure hunts');
    }
  }
);

export const getTreasureHuntClues = createAsyncThunk(
  'team/getTreasureHuntClues',
  async (treasureHuntId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teams/treasure-hunts/${treasureHuntId}/clues`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch clues');
    }
  }
);

// Initial state
const initialState: TeamState = {
  teams: [],
  users: [],
  treasureHunts: [],
  selectedTeam: null,
  selectedTreasureHunt: null,
  clues: [],
  isLoading: false,
  error: null,
};

// Team slice
const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedTeam: (state, action: PayloadAction<Team | null>) => {
      state.selectedTeam = action.payload;
    },
    setSelectedTreasureHunt: (state, action: PayloadAction<TreasureHunt | null>) => {
      state.selectedTreasureHunt = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Team
      .addCase(createTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teams.push(action.payload);
        state.error = null;
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add Member
      .addCase(addMemberToTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addMemberToTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the team with new member
        const teamIndex = state.teams.findIndex(team => team.id === action.payload.id);
        if (teamIndex !== -1) {
          state.teams[teamIndex] = action.payload;
        }
        state.error = null;
      })
      .addCase(addMemberToTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Treasure Hunt
      .addCase(createTreasureHunt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTreasureHunt.fulfilled, (state, action) => {
        state.isLoading = false;
        state.treasureHunts.push(action.payload);
        state.error = null;
      })
      .addCase(createTreasureHunt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Submit Clue
      .addCase(submitClue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitClue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clues.push(action.payload);
        state.error = null;
      })
      .addCase(submitClue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Approve Clue
      .addCase(approveClue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveClue.fulfilled, (state, action) => {
        state.isLoading = false;
        const clueIndex = state.clues.findIndex(clue => clue.id === action.payload.id);
        if (clueIndex !== -1) {
          state.clues[clueIndex] = action.payload;
        }
        state.error = null;
      })
      .addCase(approveClue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Reject Clue
      .addCase(rejectClue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectClue.fulfilled, (state, action) => {
        state.isLoading = false;
        const clueIndex = state.clues.findIndex(clue => clue.id === action.payload.id);
        if (clueIndex !== -1) {
          state.clues[clueIndex] = action.payload;
        }
        state.error = null;
      })
      .addCase(rejectClue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get All Teams
      .addCase(getAllTeams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllTeams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teams = action.payload;
        state.error = null;
      })
      .addCase(getAllTeams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Team Treasure Hunts
      .addCase(getTeamTreasureHunts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTeamTreasureHunts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.treasureHunts = action.payload;
        state.error = null;
      })
      .addCase(getTeamTreasureHunts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Treasure Hunt Clues
      .addCase(getTreasureHuntClues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTreasureHuntClues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clues = action.payload;
        state.error = null;
      })
      .addCase(getTreasureHuntClues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedTeam, setSelectedTreasureHunt } = teamSlice.actions;
export default teamSlice.reducer;