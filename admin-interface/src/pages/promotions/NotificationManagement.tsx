import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const NotificationManagement: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Gửi thông báo
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Trang quản lý gửi thông báo khuyến mãi. (Nội dung sẽ được bổ sung sau)</Typography>
      </Paper>
    </Box>
  );
};

export default NotificationManagement; 