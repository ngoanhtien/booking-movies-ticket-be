import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const RoomManagement: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Quản lý phòng chiếu
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Trang quản lý phòng chiếu. (Nội dung sẽ được bổ sung sau)</Typography>
      </Paper>
    </Box>
  );
};

export default RoomManagement; 