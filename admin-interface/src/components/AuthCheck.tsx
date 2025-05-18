import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { checkAuth, loginSuccess, loginFailure, logout } from '../store/slices/authSlice';
import axiosInstance from '../utils/axios';
import { Box, CircularProgress, Typography } from '@mui/material';

const AuthCheck: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, initialized, token, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialized);

  useEffect(() => {
    if (!initialized) {
      console.log("AuthCheck Effect 1: Store not initialized. Dispatching checkAuth().");
      dispatch(checkAuth());
    } else {
      setIsLoading(false);
    }
  }, [dispatch, initialized]);

  useEffect(() => {
    if (initialized) {
      if (isAuthenticated && !user && token) {
        console.log("AuthCheck Effect 2: Initialized, authenticated, but no user object. Fetching /user/me...");
        setIsLoading(true);
        axiosInstance.get('/user/me')
          .then(response => {
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
                token: token,
                refreshToken: refreshToken === null ? undefined : refreshToken
              }));
              console.log("AuthCheck Effect 2: User data fetched and stored in Redux.");
            } else {
              console.error("AuthCheck Effect 2: /user/me fetch succeeded but no user data. Logging out.");
              dispatch(logout());
            }
          })
          .catch(error => {
            console.error("AuthCheck Effect 2: Error fetching /user/me. Logging out.", error);
            dispatch(logout());
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else if (isAuthenticated && user) {
        console.log("AuthCheck Effect 2: Initialized, authenticated, and user exists.");
        setIsLoading(false);
      } else if (!initialized && !isAuthenticated) {
        console.log("AuthCheck Effect 2: Initialized, but not authenticated (was !initialized && !isAuthenticated)");
        setIsLoading(false);
      } else if (initialized && !isAuthenticated) {
        console.log("AuthCheck Effect 2: Initialized and not authenticated. Ensuring loading is false.");
        setIsLoading(false);
      }
    }
  }, [dispatch, initialized, isAuthenticated, user, token, refreshToken]);

  if (isLoading) {
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