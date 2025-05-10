import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { checkAuth, loginSuccess, loginFailure } from '../store/slices/authSlice';
import axiosInstance from '../utils/axios';
import { Box, CircularProgress, Typography } from '@mui/material';

interface RootState {
  auth: {
    isAuthenticated: boolean;
    user: any;
    initialized: boolean;
    tokenExpiresAt: number | null;
  };
}

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface TokenData {
  accessToken: string;
  refreshToken?: string;
}

const AuthCheck: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, initialized, tokenExpiresAt } = useSelector(
    (state: RootState) => state.auth
  );
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!token && !refreshToken) {
          dispatch(checkAuth());
          setIsChecking(false);
          return;
        }

        if (isAuthenticated && user && initialized) {
          setIsChecking(false);
          return;
        }

        // Check if token is still valid
        if (token && tokenExpiresAt && Date.now() < tokenExpiresAt - 5000) {
          try {
            const response = await axiosInstance.get('/user/me');
            const userData = response.data?.result || response.data?.data;

            if (userData) {
              dispatch(loginSuccess({
                user: {
                  id: userData.id,
                  email: userData.email,
                  fullName: userData.fullName,
                  name: userData.fullName,
                  role: userData.role
                },
                token,
                refreshToken: refreshToken || undefined
              }));
            }
          } catch (error) {
            console.error('Error verifying token:', error);
            dispatch(checkAuth());
          }
        } else if (refreshToken) {
          try {
            const response = await axiosInstance.post<{result: TokenData}>('/auth/refresh-token', {
              refreshToken
            });

            const newTokens = response.data.result;
            if (newTokens?.accessToken) {
              localStorage.setItem('token', newTokens.accessToken);
              if (newTokens.refreshToken) {
                localStorage.setItem('refreshToken', newTokens.refreshToken);
              }

              const userResponse = await axiosInstance.get('/user/me');
              const userData = userResponse.data?.result || userResponse.data?.data;

              if (userData) {
                dispatch(loginSuccess({
                  user: {
                    id: userData.id,
                    email: userData.email,
                    fullName: userData.fullName,
                    name: userData.fullName,
                    role: userData.role
                  },
                  token: newTokens.accessToken,
                  refreshToken: newTokens.refreshToken
                }));
              }
            } else {
              throw new Error('Invalid refresh token response');
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            dispatch(loginFailure('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch(checkAuth());
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [dispatch, isAuthenticated, user, initialized, tokenExpiresAt]);

  if (isChecking) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh' 
        }}
      >
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