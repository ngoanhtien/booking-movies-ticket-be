import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import AppRoutes from './routes';
import { store } from './store';
import AuthCheck from './components/AuthCheck';
import './i18n';
import axios from 'axios';

// Tạo một instance axios riêng cho toàn bộ ứng dụng
const axiosInstance = axios.create({
  // Sử dụng đường dẫn tương đối để proxy hoạt động
  baseURL: ''
});

// Interceptor cho mọi request
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      // Đảm bảo headers tồn tại
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Adding token to request:', config.url);
    } else {
      console.log('No token available for request:', config.url);
    }
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor cho mọi response
axiosInstance.interceptors.response.use(
  response => {
    console.log('Response received for:', response.config.url);
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // Nếu là lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Unauthorized error. Attempting token refresh...');
      
      try {
        // Thử refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('No refresh token available');
          // Logout user
          store.dispatch({ type: 'auth/logout' });
          return Promise.reject(error);
        }
        
        // Call refresh token endpoint
        const response = await axios.post('/auth/refresh', { refreshToken });
        console.log('Token refresh response:', response.data);
        
        if (response.data && (response.data.result || response.data.data)) {
          const tokenData = response.data.result || response.data.data;
          const { accessToken, refreshToken: newRefreshToken } = tokenData;
          
          // Update tokens
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Update request authorization header
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          
          // Retry the original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Logout user
        store.dispatch({ type: 'auth/logout' });
      }
    }
    
    return Promise.reject(error);
  }
);

// Sử dụng axiosInstance thay thế cho axios mặc định
axios.defaults.baseURL = axiosInstance.defaults.baseURL;
axios.interceptors.request.clear();
axios.interceptors.response.clear();
axios.interceptors.request.use(axiosInstance.interceptors.request as any);
axios.interceptors.response.use(axiosInstance.interceptors.response as any);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthCheck />
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
