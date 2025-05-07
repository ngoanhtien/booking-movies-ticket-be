import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Mock user for UI development
const mockUser: User = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'ADMIN'
};

const initialState: AuthState = {
  user: mockUser,
  token: 'mock-token',
  isAuthenticated: true, // Set to true to bypass authentication
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    checkAuth: (state) => {
      // For UI development, always return authenticated
      state.isAuthenticated = true;
      state.user = mockUser;
      state.token = 'mock-token';
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, checkAuth } = authSlice.actions;
export default authSlice.reducer; 