import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuth, loginSuccess, loginFailure } from '../store/slices/authSlice';
import axios from 'axios';
import { Box, CircularProgress, Typography } from '@mui/material';

const AuthCheck: React.FC = () => {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        // Đầu tiên kiểm tra token trong localStorage
        const token = localStorage.getItem('token');
        console.log("Token found in localStorage:", token ? "Yes" : "No");
        
        if (!token) {
          console.log("No token found, user is not authenticated");
          dispatch(checkAuth()); // Cập nhật state là không xác thực
          setAuthChecked(true);
          return;
        }
        
        // Token sẽ được thêm tự động bởi axios interceptor
        // Không cần đặt token vào header thủ công
        console.log("Fetching user info from /user/me...");
        const userResponse = await axios.get('/user/me');
        console.log("User API response:", userResponse.data);
        
        // Kiểm tra cả hai cấu trúc response có thể xảy ra
        const userData = userResponse.data.result || userResponse.data.data;
        
        if (userData) {
          console.log("User data found, updating Redux store");
          // Tạo object user với các trường cần thiết
          const user = {
            id: userData.id,
            email: userData.email,
            fullName: userData.fullName,
            name: userData.fullName,
            role: userData.role
          };
          
          // Lấy refreshToken từ localStorage và chuyển đổi null thành undefined
          const refreshToken = localStorage.getItem('refreshToken') || undefined;
          
          // Cập nhật trạng thái với thông tin user và token
          dispatch(loginSuccess({ 
            user, 
            token,
            refreshToken
          }));
          console.log("Authentication successful, role:", user.role);
        } else {
          console.log("User data not found in API response");
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          dispatch(loginFailure('Không tìm thấy thông tin người dùng'));
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
        // Error sẽ được xử lý bởi axios interceptor
        // Chỉ cần cập nhật state redux
        dispatch(loginFailure('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'));
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkUserAuth();
  }, [dispatch]);

  // Chờ cho đến khi kiểm tra xác thực hoàn tất
  if (!authChecked) {
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
          Đang xác thực người dùng...
        </Typography>
      </Box>
    );
  }

  return null;
};

export default AuthCheck; 