import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  employeeCode?: string;
  gender?: string;
  profileImage?: string;
  department?: string;
  hobbies?: string[];
  roomNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  team?: {
    id: string;
    name: string;
  } | null;
  categories?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  points?: number;
  rank?: number;
  activeChallenges?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  categoryIds: string[];
  employeeCode: string;
  gender: string;
  hobbies: string;
  profileImageUrl: string;
  idProofUrl: string;
  declarationAccepted: boolean;
}

interface LoginData {
  email: string;
  password: string;
  deviceToken?: string;
}

interface OTPVerifyData {
  email: string;
  otp: string;
  deviceToken?: string;
}

// API base URL - replace with your actual API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });
      
      // Don't automatically log in the user after registration
      // Just return success message
      return { success: true, message: response.data.message };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Enhanced error handling
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue('Registration timeout. Please check your internet connection and try again.');
      }
      
      if (error.code === 'ERR_NETWORK') {
        return rejectWithValue('Network error. Please check if the server is running and try again.');
      }
      
      if (error.response?.status === 400) {
        return rejectWithValue(error.response?.data?.message || 'Invalid data provided. Please check your inputs.');
      }
      
      if (error.response?.status === 409) {
        return rejectWithValue('User already exists with this email or employee code.');
      }
      
      return rejectWithValue(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  }
);

export const registerAdmin = createAsyncThunk(
  'auth/registerAdmin',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register/admin', userData);
      const { token, user } = response.data.data;
      
      Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
      
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Admin registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (loginData: LoginData, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', loginData);
      const { token, user } = response.data.data;
      
      Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
      
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const loginWithOTP = createAsyncThunk(
  'auth/loginWithOTP',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login/otp', { email });
      return response.data.message;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'OTP request failed');
    }
  }
);

export const verifyOTPLogin = createAsyncThunk(
  'auth/verifyOTPLogin',
  async (otpData: OTPVerifyData, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login/otp/verify', otpData);
      const { token, user } = response.data.data;
      
      Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
      
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateDeviceToken = createAsyncThunk(
  'auth/updateDeviceToken',
  async (deviceToken: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/device-token', { deviceToken });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update device token');
    }
  }
);

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      Cookies.remove('token');
    },
    setAuthFromToken: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Don't set authentication state - user needs to log in separately
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Register Admin
      .addCase(registerAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // OTP Login
      .addCase(loginWithOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginWithOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Verify OTP
      .addCase(verifyOTPLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTPLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyOTPLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Update Device Token
      .addCase(updateDeviceToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateDeviceToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateDeviceToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, logout, setAuthFromToken } = authSlice.actions;
export default authSlice.reducer;