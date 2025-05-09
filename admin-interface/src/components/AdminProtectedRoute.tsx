import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useSelector((state: any) => state.auth);
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Kiểm tra người dùng đã đăng nhập chưa
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra người dùng có role ADMIN không
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute; 