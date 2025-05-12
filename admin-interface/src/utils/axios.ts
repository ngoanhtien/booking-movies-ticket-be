import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store';
import { logout, loginSuccess } from '../store/slices/authSlice';

// Mở rộng kiểu dữ liệu InternalAxiosRequestConfig để bao gồm _skipInterceptors
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _skipInterceptors?: boolean;
    _retry?: boolean;
  }
  
  export interface AxiosRequestConfig {
    _skipInterceptors?: boolean;
    _retry?: boolean;
  }
}

// API URL Constants
const API_BASE_URL = process.env.REACT_APP_API_URL || '';
const DEBUG = process.env.NODE_ENV !== 'production';

// Biến cờ để theo dõi nếu đang trong quá trình refresh token
let isRefreshing = false;
// Mảng chứa các callback để thực thi sau khi refresh token thành công
let failedQueue: { resolve: Function; reject: Function }[] = [];

// Hàm xử lý khi refresh token thành công
const processQueue = (error: any, token: string | null = null) => {
  if (DEBUG) console.log(`processQueue: ${failedQueue.length} requests waiting, ${error ? 'with error' : 'successfully'}`);
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  // Reset hàng đợi
  failedQueue = [];
};

// Hàm để kiểm tra token hết hạn
const isTokenExpired = () => {
  const token = localStorage.getItem('token');
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  
  if (!token || !expiresAt) return true;
  
  // Add 5 second buffer to prevent edge cases
  return Date.now() > (parseInt(expiresAt) - 5000);
};

// Define types for token response
interface TokenResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  result?: {
    accessToken?: string;
    token?: string;
    refreshToken?: string;
  };
}

// Hàm để refresh token
const refreshAuthToken = async () => {
  console.log('Refreshing authentication token...');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    // Create raw axios instance to avoid interceptor loops
    const axiosRaw = axios.create({
      baseURL: '',
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Try both endpoints that are permitted in SecurityConfiguration
    try {
      console.log('Trying /auth/refresh endpoint...');
      const tokenResponse = await axiosRaw.post('/auth/refresh', { refreshToken });
      
      if (tokenResponse.status === 200) {
        return processTokenResponse(tokenResponse.data);
      }
    } catch (err) {
      console.log('Trying /auth/refresh-token endpoint...');
      const tokenResponse = await axiosRaw.post('/auth/refresh-token', { refreshToken });
      
      if (tokenResponse.status === 200) {
        return processTokenResponse(tokenResponse.data);
      }
    }
    
    throw new Error('Both refresh token endpoints failed');
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Helper to process token response in a consistent way
function processTokenResponse(responseData: unknown): string {
  // Handle string response
  let tokenData: TokenResponse;
  
  if (typeof responseData === 'string') {
    try {
      tokenData = JSON.parse(responseData) as TokenResponse;
      console.log("Successfully parsed string response");
    } catch (e) {
      console.error('Failed to parse token response:', e);
      throw new Error('Invalid token response format');
    }
  } else {
    tokenData = responseData as TokenResponse;
  }
  
  // Extract token from various possible structures
  let accessToken: string | undefined = undefined;
  let newRefreshToken: string | undefined = undefined;
  
  // Check for result wrapper
  if (tokenData.result) {
    accessToken = tokenData.result.accessToken || tokenData.result.token;
    newRefreshToken = tokenData.result.refreshToken;
  } else {
    // Direct properties
    accessToken = tokenData.accessToken || tokenData.token;
    newRefreshToken = tokenData.refreshToken;
  }
  
  if (!accessToken) {
    throw new Error('No token found in response');
  }
  
  // Update localStorage
  localStorage.setItem('token', accessToken);
  if (newRefreshToken) {
    localStorage.setItem('refreshToken', newRefreshToken);
  }
  
  // Set expiration (55 minutes from now to allow buffer for refresh)
  const expiresAt = Date.now() + 55 * 60 * 1000;
  localStorage.setItem('tokenExpiresAt', expiresAt.toString());
  
  console.log('Token refreshed successfully');
  return accessToken;
}

// Create axios instance with enhanced debugging
const axiosInstance = axios.create({
  baseURL: '',
  timeout: 30000,
  transformResponse: [(data) => {
    // Try to parse JSON response while handling circular references
    if (typeof data === 'string') {
      try {
        const references = new WeakMap();
        
        // Custom JSON parser to handle circular references
        const reviver = (key: string, value: any) => {
          if (typeof value === 'object' && value !== null) {
            if (references.has(value)) {
              return references.get(value);
            }
            references.set(value, value);
          }
          return value;
        };

        return JSON.parse(data, reviver);
      } catch (e) {
        console.warn('Failed to parse response:', e);
        return data;
      }
    }
    return data;
  }],
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

// Debug counter for request tracking
let requestCounter = 0;

// Add request interceptor with improved debugging
axiosInstance.interceptors.request.use(
  (config) => {
    const currentRequestId = ++requestCounter;
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log(`[${currentRequestId}] Token added to axios request: ${config.url}`, config.method?.toUpperCase());
    } else {
      console.warn(`[${currentRequestId}] No token available for request: ${config.url}`);
    }
    
    // Store request ID on config for response correlation
    config.headers['X-Request-ID'] = currentRequestId.toString();
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor with enhanced error handling and debugging
axiosInstance.interceptors.response.use(
  response => {
    const method = response.config.method?.toUpperCase() || '?';
    const url = response.config.url;
    console.log(`[${requestCounter++}] Response success: ${response.status} ${method} ${url}`);
    return response;
  },
  async error => {
    const originalRequest = error.config;
    const method = originalRequest.method?.toUpperCase() || '?';
    const url = originalRequest.url;
    
    console.log(`[${requestCounter++}] Error response: ${error.response?.status || 'No response'} ${method} ${url}`);
    console.error(error.response?.data || error.message);
    
    // Đối với lỗi 500 Internal Server Error từ các API booking và payment
    if (error.response?.status === 500 && !originalRequest._retry) {
      // Đánh dấu request đã được thử lại một lần
      originalRequest._retry = true;
      
      // Đối với booking endpoint
      if (url.includes('/bookings/create') || url.includes('/api/v1/bookings/create')) {
        console.log('Thử dùng endpoint thay thế cho bookings/create');
        try {
          // Nếu URL ban đầu là '/bookings/create', thử '/api/v1/bookings/create'
          if (url === '/bookings/create') {
            originalRequest.url = '/api/v1/bookings/create';
            return axiosInstance(originalRequest);
          }
          
          // Nếu URL ban đầu là '/api/v1/bookings/create', thử '/api/v1/payment/sepay-webhook'
          if (url === '/api/v1/bookings/create') {
            originalRequest.url = '/api/v1/payment/sepay-webhook';
            return axiosInstance(originalRequest);
          }
        } catch (retryError) {
          console.error('Thử lại đã thất bại:', retryError);
        }
      }
      
      // Đối với payment endpoint
      if (url.includes('/payments/simulate') || url.includes('/api/v1/payments/simulate')) {
        console.log('Thử dùng endpoint thay thế cho payments/simulate');
        try {
          // Nếu URL ban đầu là '/payments/simulate', thử '/api/v1/payments/simulate'
          if (url === '/payments/simulate') {
            originalRequest.url = '/api/v1/payments/simulate';
            return axiosInstance(originalRequest);
          }
          
          // Nếu URL ban đầu là '/api/v1/payments/simulate', thử '/api/v1/payment/process'
          if (url === '/api/v1/payments/simulate') {
            originalRequest.url = '/api/v1/payment/process';
            return axiosInstance(originalRequest);
          }
        } catch (retryError) {
          console.error('Thử lại đã thất bại:', retryError);
        }
      }
    }
    
    // Nếu không thể retry hoặc không phải lỗi cần retry, throw lỗi bình thường
    return Promise.reject(error);
  }
);

// Configure default axios to use the same interceptors as axiosInstance
const axiosRequestInterceptor = axios.interceptors.request.use(
  (config) => {
    if (config._skipInterceptors) {
      if (DEBUG) console.log(`Skipping interceptors for axios default request: ${config.url}`);
      delete config._skipInterceptors;
      return config;
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
      if (DEBUG) console.log(`Token added to axios default request: ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Axios default request interceptor error:', error);
    return Promise.reject(error);
  }
);

const axiosResponseInterceptor = axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Kiểm tra xem request có bỏ qua interceptor không
    if (originalRequest?._skipInterceptors) {
      delete originalRequest._skipInterceptors;
      return Promise.reject(error);
    }
    
    // Xử lý 401 hoặc token hết hạn
    if ((error.response?.status === 401 && !originalRequest?._retry) || 
        (!originalRequest?._retry && isTokenExpired())) {
      
      if (!originalRequest) {
        // Nếu không có request gốc, đăng xuất luôn
        store.dispatch(logout());
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      if (isRefreshing) {
        if (DEBUG) console.log('Adding request to queue while token refresh is in progress (axios)');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      
      isRefreshing = true;
      if (DEBUG) console.log('Token expired in axios interceptor. Attempting to refresh...');
      
      try {
        // Gọi hàm refresh token
        const newToken = await refreshAuthToken();
        
        // Cập nhật header cho request gốc
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Thông báo cho tất cả các request đang đợi
        processQueue(null, newToken);
        
        // Thử lại request gốc
        return axios(originalRequest);
      } catch (refreshError) {
        if (DEBUG) console.error('Refresh token error (axios):', refreshError);
        processQueue(refreshError, null);
        store.dispatch(logout());
        
        // Chuyển hướng đến trang đăng nhập
        setTimeout(() => {
          window.location.href = '/login?expired=true';
        }, 100);
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 