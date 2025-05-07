import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TheaterLocations: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Vị trí cụm rạp
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Trang quản lý vị trí cụm rạp. (Nội dung sẽ được bổ sung sau)</Typography>
      </Paper>
    </Box>
  );
};

export default TheaterLocations; 