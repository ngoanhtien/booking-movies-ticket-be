import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Alert, Paper } from '@mui/material';
import BookingForm from './BookingForm'; // Assuming BookingForm is in the same directory
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axios';

interface RootState {
  auth: {
    isAuthenticated: boolean;
    token: string | null;
  };
}

interface BookingPageProps {
  directBooking?: boolean;
}

const BookingPage: React.FC<BookingPageProps> = ({ directBooking = false }) => {
  const { movieId, cinemaId } = useParams<{ movieId: string; cinemaId: string }>();
  const navigate = useNavigate();
  const [movieName, setMovieName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if direct booking was requested via localStorage
    const isDirectBooking = localStorage.getItem('directBooking') === 'true';
    
    if (isDirectBooking) {
      // Clear the flag
      localStorage.removeItem('directBooking');
    }
    
    // Get movie name if movieId exists
    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);
  
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const fetchMovieDetails = async () => {
    try {
      const response = await axiosInstance.get(`/movie/detail/${movieId}`);
      const data = response.data;
      
      // Extract movie name from response
      const movieName = data.result?.name || data.name || data.title || 'Unknown Movie';
      setMovieName(movieName);
    } catch (err: any) {
      setError(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Trang Đặt Vé
        </Typography>
        {movieName && (
          <Typography variant="h6" color="text.secondary">
            {movieName}
          </Typography>
        )}
      </Box>
      
      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Booking form - Only show if authenticated */}
      {isAuthenticated ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper sx={{ p: 3, width: '100%' }}>
            <Typography variant="h5" gutterBottom align="center">
              Biểu Mẫu Đặt Vé
            </Typography>
            <BookingForm movieId={movieId} cinemaId={cinemaId} directBooking={directBooking} />
          </Paper>
        </Box>
      ) : (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Vui lòng đăng nhập để đặt vé.
        </Alert>
      )}
    </Container>
  );
};

export default BookingPage; 