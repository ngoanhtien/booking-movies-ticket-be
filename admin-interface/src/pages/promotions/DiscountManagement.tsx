import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const DiscountManagement: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Mã giảm giá
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Trang quản lý mã giảm giá. (Nội dung sẽ được bổ sung sau)</Typography>
      </Paper>
    </Box>
  );
};

export default DiscountManagement; 