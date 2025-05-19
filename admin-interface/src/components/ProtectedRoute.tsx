import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { CircularProgress, Box } from '@mui/material';
import axiosInstance from '../utils/axios';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingToken(true);
        const token = localStorage.getItem('token');
        // Không cần kiểm tra token nếu đã xác thực qua Redux store
        if (isAuthenticated && user) {
          setIsTokenValid(true);
          setIsLoading(false);
          setIsCheckingToken(false);
          return;
        }

        // Kiểm tra nếu có token trong localStorage
        if (token) {
          try {
            console.log('Kiểm tra token...');
            const response = await axiosInstance.get('/user/me');
            
            if (response.data && response.data.result) {
              console.log('Token hợp lệ:', response.data);
              setIsTokenValid(true);
            } else {
              console.error('Response không hợp lệ từ /user/me');
              setIsTokenValid(false);
            }
          } catch (error: any) {
            // Không xử lý ở đây vì axiosInstance sẽ tự động thử refresh token
            console.error('Lỗi khi kiểm tra token:', error.message);
            if (error.response && error.response.status === 401) {
              setIsTokenValid(false);
            }
          }
        } else {
          console.log('Không tìm thấy token trong localStorage');
          setIsTokenValid(false);
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra xác thực:', error);
        setIsTokenValid(false);
      } finally {
        setIsLoading(false);
        setIsCheckingToken(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, user]);

  if (isLoading || isCheckingToken) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Nếu người dùng chưa đăng nhập hoặc token không hợp lệ
  if (!isTokenValid && !isAuthenticated) {
    // Lưu URL hiện tại vào localStorage để chuyển hướng sau khi đăng nhập
    localStorage.setItem('lastFailedUrl', location.pathname);
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Kiểm tra quyền nếu có yêu cầu vai trò
  if (requiredRoles.length > 0 && user) {
    const userRole = user.role || '';
    const hasRequiredRole = requiredRoles.includes(userRole);
    
    if (!hasRequiredRole) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 