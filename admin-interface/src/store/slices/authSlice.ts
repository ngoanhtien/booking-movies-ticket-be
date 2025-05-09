import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  fullName?: string; // Thêm fullName để phù hợp với backend response
  name?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Trạng thái ban đầu không có user và không đăng nhập
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
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
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken?: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      
      // Lưu token vào localStorage
      localStorage.setItem('token', action.payload.token);
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
      
      console.log(`User authenticated successfully. Role: ${action.payload.user.role}`);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      
      // Xóa tokens từ localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      console.log('User logged out');
    },
    checkAuth: (state) => {
      // Kiểm tra token trong localStorage
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token) {
        state.token = token;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
        console.log('Token found in localStorage, user is authenticated');
      } else {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        console.log('No token found in localStorage, user is not authenticated');
      }
    },
    updateTokens: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      
      // Cập nhật tokens trong localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      
      console.log('Auth tokens updated');
    },
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  checkAuth, 
  updateTokens 
} = authSlice.actions;

export default authSlice.reducer; 