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
  initialized: boolean; // Thêm flag để đánh dấu đã kiểm tra localStorage
  tokenExpiresAt: number | null; // Timestamp khi token hết hạn
  lastActivityTime: number; // Thời gian hoạt động cuối cùng
}

// Khởi tạo state từ localStorage nếu có
const token = localStorage.getItem('token');
const storedRefreshToken = localStorage.getItem('refreshToken');
const tokenExpiresAtStr = localStorage.getItem('tokenExpiresAt');
const tokenExpiresAt = tokenExpiresAtStr ? parseInt(tokenExpiresAtStr, 10) : null;

// Trạng thái ban đầu
const initialState: AuthState = {
  user: null,
  token: token,
  refreshToken: storedRefreshToken,
  isAuthenticated: !!token, // Nếu có token, coi như đã xác thực
  loading: false,
  error: null,
  initialized: false,
  tokenExpiresAt: tokenExpiresAt,
  lastActivityTime: Date.now(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ 
      user: User; 
      token: string; 
      refreshToken?: string;
      expiresIn?: number; // Thời gian hết hạn tính bằng giây
    }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.initialized = true;
      state.lastActivityTime = Date.now();
      
      // Tính thời gian hết hạn (mặc định là 1 giờ nếu không được cung cấp)
      const expiresIn = action.payload.expiresIn || 3600;
      state.tokenExpiresAt = Date.now() + expiresIn * 1000;
      
      // Lưu token vào localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('tokenExpiresAt', state.tokenExpiresAt.toString());
      
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
      
      console.log(`User authenticated successfully. Role: ${action.payload.user.role}, Token expires in: ${expiresIn}s`);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.tokenExpiresAt = null;
      state.initialized = true;
      
      // Đảm bảo xóa tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresAt');
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.tokenExpiresAt = null;
      state.initialized = true;
      
      // Xóa tokens từ localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresAt');
      
      console.log('User logged out');
    },
    checkAuth: (state) => {
      // Kiểm tra token trong localStorage
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedTokenExpiresAtStr = localStorage.getItem('tokenExpiresAt');
      const storedTokenExpiresAt = storedTokenExpiresAtStr ? parseInt(storedTokenExpiresAtStr, 10) : null;
      
      state.lastActivityTime = Date.now();
      
      if (storedToken) {
        // Check if token is expired
        if (storedTokenExpiresAt && Date.now() < storedTokenExpiresAt) {
          // Token is valid and not expired
          state.token = storedToken;
          state.refreshToken = storedRefreshToken; // Keep refresh token
          state.isAuthenticated = true;
          state.tokenExpiresAt = storedTokenExpiresAt;
          // DO NOT change state.user here. If it was already populated, keep it.
          console.log('Valid token found in localStorage, user is authenticated (user state preserved)');
        } else if (storedRefreshToken) {
          // Token expired, but refresh token exists
          state.token = storedToken; // Keep expired token to attempt refresh
          state.refreshToken = storedRefreshToken;
          state.isAuthenticated = false; // Set to false to trigger refresh logic elsewhere
          state.tokenExpiresAt = null;
          // DO NOT change state.user here either, as refresh might succeed
          console.log('Token expired but refresh token found (user state preserved pending refresh)');
        } else {
          // Token expired AND no refresh token
          state.isAuthenticated = false;
          state.user = null; // Reset user ONLY here
          state.token = null;
          state.refreshToken = null;
          state.tokenExpiresAt = null;
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('tokenExpiresAt');
          console.log('Token expired and no refresh token, clearing auth state');
        }
      } else {
        // No token found at all
        state.isAuthenticated = false;
        state.user = null; // Reset user ONLY here
        state.token = null;
        state.refreshToken = null;
        state.tokenExpiresAt = null;
        console.log('No token found in localStorage, user is not authenticated');
      }
      
      state.initialized = true; // Mark check as complete
    },
    updateTokens: (state, action: PayloadAction<{ 
      token: string; 
      refreshToken: string;
      expiresIn?: number;
    }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.lastActivityTime = Date.now();
      
      // Tính thời gian hết hạn (mặc định là 1 giờ nếu không được cung cấp)
      const expiresIn = action.payload.expiresIn || 3600;
      state.tokenExpiresAt = Date.now() + expiresIn * 1000;
      
      // Cập nhật tokens trong localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('tokenExpiresAt', state.tokenExpiresAt.toString());
      
      console.log('Auth tokens updated, expires in:', expiresIn, 'seconds');
    },
    refreshToken: (state, action: PayloadAction<{ 
      token: string; 
      refreshToken: string;
      expiresIn?: number;
    }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.lastActivityTime = Date.now();
      
      // Tính thời gian hết hạn (mặc định là 1 giờ nếu không được cung cấp)
      const expiresIn = action.payload.expiresIn || 3600;
      state.tokenExpiresAt = Date.now() + expiresIn * 1000;
      
      // Cập nhật tokens trong localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('tokenExpiresAt', state.tokenExpiresAt.toString());
      
      console.log('Token refreshed successfully, expires in:', expiresIn, 'seconds');
    },
    updateLastActivity: (state) => {
      state.lastActivityTime = Date.now();
    }
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  checkAuth, 
  updateTokens,
  refreshToken,
  updateLastActivity
} = authSlice.actions;

export default authSlice.reducer; 