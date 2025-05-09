import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state: any) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Đang kiểm tra đăng nhập...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Lưu lại đường dẫn hiện tại để sau khi đăng nhập có thể quay lại
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 