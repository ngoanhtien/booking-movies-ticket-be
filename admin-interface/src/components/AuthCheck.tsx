import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuth } from '../store/slices/authSlice';

const AuthCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthCheck; 