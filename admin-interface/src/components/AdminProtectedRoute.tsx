import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useSelector((state: any) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  // Debugging logs
  console.log("AdminProtectedRoute - Auth State:", { isAuthenticated, loading });
  console.log("AdminProtectedRoute - User:", user);
  console.log("AdminProtectedRoute - User Role:", user?.role);
  console.log("AdminProtectedRoute - Current Path:", location.pathname);

  // Kiểm tra quyền admin khi component mount và khi auth state thay đổi
  useEffect(() => {
    // Nếu đã xác thực và user có role ADMIN, không làm gì
    if (isAuthenticated && user?.role === 'ADMIN') {
      console.log("AdminProtectedRoute - Confirmed admin rights on path:", location.pathname);
    }
  }, [isAuthenticated, user, location.pathname]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Kiểm tra người dùng đã đăng nhập chưa
  if (!isAuthenticated) {
    console.log("AdminProtectedRoute - Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Kiểm tra người dùng có role ADMIN không
  if (user?.role !== 'ADMIN') {
    console.log("AdminProtectedRoute - Not admin role, redirecting to home. Role:", user?.role);
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  console.log("AdminProtectedRoute - Admin access granted for path:", location.pathname);
  // Trả về children nếu tất cả điều kiện đều thỏa mãn
  return <>{children}</>;
};

export default AdminProtectedRoute; 