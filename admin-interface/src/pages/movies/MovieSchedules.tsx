import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const MovieSchedules: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Lịch chiếu phim
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Trang quản lý lịch chiếu phim. (Nội dung sẽ được bổ sung sau)</Typography>
      </Paper>
    </Box>
  );
};

export default MovieSchedules; 