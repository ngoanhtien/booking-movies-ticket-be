import React from 'react';
import { Button, Box, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';

interface RootState {
  auth: {
    isAuthenticated: boolean;
    token: string | null;
  };
}

interface DirectBookingButtonProps {
  movieId: string | number;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  showDebugInfo?: boolean;
}

const DirectBookingButton: React.FC<DirectBookingButtonProps> = ({ 
  movieId, 
  variant = 'contained', 
  size = 'large',
  showDebugInfo = false
}) => {
  const navigate = useNavigate();

  const location = useLocation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleDirectBooking = () => {
    if (!isAuthenticated) {
      // Save the booking destination for post-login redirect
      localStorage.setItem('lastFailedUrl', `/book-tickets/${movieId}`);
      // Redirect to login with return URL
      navigate('/login', {
        state: { from: `/book-tickets/${movieId}` }
      });
      return;
    }

    // User is authenticated, proceed with booking
    localStorage.setItem('directBooking', 'true');
    localStorage.setItem('lastMovieId', movieId.toString());
    navigate(`/book-tickets/${movieId}`);
  };

  return (
    <Box>
      <Button
        variant={variant}
        color="primary"
        size={size}
        startIcon={<LocalActivityIcon />}
        onClick={handleDirectBooking}
        sx={{ 
          fontWeight: 'bold',
          borderRadius: 2,
          textTransform: 'none',
        }}
      >
        Book Tickets Directly
      </Button>
      
      {showDebugInfo && (
        <Alert severity="info" sx={{ mt: 1, fontSize: '0.75rem' }}>
          This button bypasses the cinema selection step for faster booking.
        </Alert>
      )}
    </Box>
  );
};

export default DirectBookingButton; 