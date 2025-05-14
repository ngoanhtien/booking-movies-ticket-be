import React from 'react';
import { Box, Container, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import UserHeader from './UserHeader';
import Footer from '../Footer';

const UserLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <UserHeader />
      
      <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
        <Outlet />
      </Box>
      
      <Footer />
    </Box>
  );
};

export default UserLayout; 