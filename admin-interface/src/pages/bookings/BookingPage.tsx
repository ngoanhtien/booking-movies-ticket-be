import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Alert, Paper } from '@mui/material';
import BookingForm from './BookingForm';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  directSeatSelection?: boolean;
}

const BookingPage: React.FC<BookingPageProps> = ({ directBooking = false, directSeatSelection = false }) => {
  const { movieId, cinemaId, showtimeId } = useParams<{ 
    movieId: string; 
    cinemaId: string; 
    showtimeId: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [movieName, setMovieName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extract branch and showtime information from location state
  const branchId = location.state?.branchId;
  const selectedShowtimeId = location.state?.showtimeId || showtimeId;
  const roomType = location.state?.roomType;
  const selectedDate = location.state?.selectedDate;

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
    } else if (directSeatSelection && selectedShowtimeId) {
      // For direct seat selection, try to get movie info from the showtime ID
      fetchShowtimeDetails();
    }
  }, [movieId, directSeatSelection, selectedShowtimeId]);
  
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const fetchShowtimeDetails = async () => {
    try {
      if (!selectedShowtimeId) {
        setError('No showtime ID provided');
        setLoading(false);
        return;
      }
      
      const response = await axiosInstance.get(`/api/v1/showtimes/${selectedShowtimeId}`);
      const data = response.data?.result || response.data;
      
      if (data && data.movieName) {
        setMovieName(data.movieName);
      } else {
        setMovieName('Selected Movie');
      }
    } catch (err: any) {
      console.error('Error fetching showtime details:', err);
      setMovieName('Selected Movie');
      // Don't set error here, as we can still proceed with the booking
    } finally {
      setLoading(false);
    }
  };
  
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
          {directSeatSelection ? 'Chọn Ghế Ngồi' : 'Trang Đặt Vé'}
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
              {directSeatSelection ? 'Chọn Ghế Ngồi' : 'Biểu Mẫu Đặt Vé'}
            </Typography>
            <BookingForm 
              movieId={movieId} 
              cinemaId={cinemaId} 
              directBooking={directBooking} 
              showtimeId={selectedShowtimeId}
              branchId={branchId?.toString()}
              roomType={roomType}
            />
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