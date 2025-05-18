import React, { useState, useEffect } from 'react';
import { Button, Box, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchShowtimesByMovie } from '../services/movieService';

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
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  
  // Lấy ngày hiện tại để fetch lịch chiếu
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  // Sử dụng React Query để lấy danh sách lịch chiếu
  const { 
    data: showtimesData,
    isLoading: isShowtimesLoading,
    isError: isShowtimesError
  } = useQuery({
    queryKey: ['directBookingShowtimes', movieId, formattedDate],
    queryFn: () => fetchShowtimesByMovie(movieId.toString(), formattedDate),
    enabled: false, // Không tự động fetch, chỉ fetch khi cần
  });

  const handleDirectBooking = async () => {
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
    setIsLoading(true);
    
    try {
      // Lấy dữ liệu lịch chiếu
      const showtimes = await fetchShowtimesByMovie(movieId.toString(), formattedDate);
      
      // Nếu có lịch chiếu, điều hướng trực tiếp đến trang chọn ghế của lịch chiếu đầu tiên
      if (showtimes && showtimes.branches && showtimes.branches.length > 0) {
        const firstBranch = showtimes.branches[0];
        if (firstBranch.showtimes && firstBranch.showtimes.length > 0) {
          const firstShowtime = firstBranch.showtimes[0];
          
          // Điều hướng đến trang chọn ghế
          navigate(`/bookings/seat-selection/${firstShowtime.scheduleId}`, {
            state: {
              branchId: firstBranch.branchId,
              showtimeId: firstShowtime.scheduleId,
              roomType: firstShowtime.roomType || '2D',
              selectedDate: formattedDate,
              movieId: movieId
            }
          });
          return;
        }
      }
      
      // Nếu không có lịch chiếu, vẫn sử dụng phương thức cũ
      localStorage.setItem('directBooking', 'true');
      localStorage.setItem('lastMovieId', movieId.toString());
      navigate(`/book-tickets/${movieId}`);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      // Sử dụng phương thức cũ khi gặp lỗi
      localStorage.setItem('directBooking', 'true');
      localStorage.setItem('lastMovieId', movieId.toString());
      navigate(`/book-tickets/${movieId}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Button
        variant={variant}
        color="primary"
        size={size}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LocalActivityIcon />}
        onClick={handleDirectBooking}
        disabled={isLoading}
        sx={{ 
          fontWeight: 'bold',
          borderRadius: 2,
          textTransform: 'none',
        }}
      >
        {isLoading ? t('common.loading', 'Đang tải...') : t('movies.bookTickets', 'Đặt vé')}
      </Button>
      
      {showDebugInfo && (
        <Alert severity="info" sx={{ mt: 1, fontSize: '0.75rem' }}>
          {t('bookings.directBookingInfo', 'Nút này bỏ qua bước chọn rạp để đặt vé nhanh hơn.')}
        </Alert>
      )}
    </Box>
  );
};

export default DirectBookingButton; 