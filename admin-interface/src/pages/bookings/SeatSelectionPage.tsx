import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Alert, 
  Paper, 
  Button, 
  Grid,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { alpha, useTheme } from '@mui/material/styles';
import axiosInstance from '../../utils/axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

// Định nghĩa enums và interfaces
enum SeatStatus {
  Available = 'AVAILABLE',
  Booked = 'BOOKED',
  Selected = 'SELECTED',
  Unavailable = 'UNAVAILABLE'
}

interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
  type: 'REGULAR' | 'VIP' | 'COUPLE' | 'SWEETBOX' | 'AISLE';
  price: number;
}

interface ShowtimeInfo {
  scheduleId: number;
  roomId: number;
  roomName: string;
  branchName: string;
  movieName: string;
  scheduleTime: string;
  scheduleDate: string;
}

interface RootState {
  auth: {
    isAuthenticated: boolean;
    token: string | null;
  };
}

const SeatSelectionPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  
  // Extract parameters from location state
  const branchId = location.state?.branchId;
  const roomType = location.state?.roomType;
  const selectedDate = location.state?.selectedDate;
  const movieId = location.state?.movieId;
  
  // Local state
  const [seatLayout, setSeatLayout] = useState<Seat[][]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showtimeInfo, setShowtimeInfo] = useState<ShowtimeInfo | null>(null);
  
  // Get authentication state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Handle back button click
  const handleBack = () => {
    // Navigate back to the movie details page if we have a movieId
    if (movieId) {
      navigate(`/movies/${movieId}`);
    } else {
      // Otherwise, go to the movies list
      navigate('/movies');
    }
  };

  // Load seat layout
  useEffect(() => {
    const fetchSeatLayout = async () => {
      if (!showtimeId) {
        setError("Không có thông tin suất chiếu");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch showtime info first
        const showtimeResponse = await axiosInstance.get(`/api/v1/showtimes/${showtimeId}`);
        const showtimeData = showtimeResponse.data?.result || showtimeResponse.data;
        
        if (showtimeData) {
          setShowtimeInfo({
            scheduleId: parseInt(showtimeId),
            roomId: showtimeData.roomId || 0,
            roomName: showtimeData.roomName || "Phòng chiếu",
            branchName: showtimeData.branchName || "Rạp chiếu",
            movieName: showtimeData.movieName || "Phim",
            scheduleTime: showtimeData.scheduleTime || "",
            scheduleDate: showtimeData.scheduleDate || selectedDate || ""
          });
        }
        
        // *** MOCK SEAT LAYOUT DATA WITH TYPES AND PRICES ***
        // In a real scenario, this data would come from an API endpoint
        const mockSeatsFromAPI: Seat[] = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const seatsPerRow = 12;
        let idCounter = 1;

        rows.forEach(row => {
          for (let i = 1; i <= seatsPerRow; i++) {
            let status = SeatStatus.Available;
            let type: Seat['type'] = 'REGULAR';
            let price = 70000; // Default price

            // Randomly assign some booked seats
            if (Math.random() < 0.2) status = SeatStatus.Booked;
            // Randomly assign some unavailable seats (e.g., for lối đi, hỏng)
            if (Math.random() < 0.05 && status === SeatStatus.Available) status = SeatStatus.Unavailable;

            // Assign types and adjust prices based on type and row
            if (row === 'G' || row === 'H') {
              type = 'VIP';
              price += 30000; // VIP price increase
            } else if ((row === 'E' || row === 'F') && (i >= 5 && i <= 8)) {
              type = 'COUPLE';
              price += 50000; // Couple seat price
            } else if (row === 'A' && (i === 1 || i === seatsPerRow)) {
                type = 'SWEETBOX';
                price += 40000;
            }

            // Some seats might be unavailable regardless of booking status
            if ((row === 'D' && i === 6) || (row === 'D' && i === 7)) { // e.g. lối đi
                status = SeatStatus.Unavailable;
                type = 'AISLE'; // Custom type for aisle
            }

            mockSeatsFromAPI.push({
              id: `seat-${row}${i}-${idCounter++}`,
              row,
              number: i,
              status,
              type,
              price
            });
          }
        });

        // Organize seats by row
        const rowMap = new Map<string, Seat[]>();
        mockSeatsFromAPI.forEach((seat: Seat) => {
          if (!rowMap.has(seat.row)) {
            rowMap.set(seat.row, []);
          }
          rowMap.get(seat.row)?.push(seat);
        });
        
        const layout: Seat[][] = Array.from(rowMap.values());
        layout.sort((a, b) => a[0].row.localeCompare(b[0].row));
        layout.forEach(row => row.sort((a, b) => a.number - b.number));
        
        setSeatLayout(layout);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching seat layout:', err);
        setError(err.message || 'Lỗi khi tải thông tin ghế ngồi');
        setLoading(false);
      }
    };

    fetchSeatLayout();
  }, [showtimeId, selectedDate]);

  // Handle seat selection
  const handleSeatSelection = (seat: Seat) => {
    if (seat.status === SeatStatus.Booked || seat.status === SeatStatus.Unavailable) {
      return;
    }

    setSelectedSeats(prev => {
      const isSelected = prev.includes(seat.id);
      if (isSelected) {
        return prev.filter(id => id !== seat.id);
      } else {
        return [...prev, seat.id];
      }
    });
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      for (const row of seatLayout) {
        const seat = row.find(s => s.id === seatId);
        if (seat) {
          return total + seat.price;
        }
      }
      return total;
    }, 0);
  };

  // Get seat color based on status and type
  const getSeatColors = (seat: Seat) => {
    const isSelected = selectedSeats.includes(seat.id);
    
    if (isSelected) return theme.palette.success.main; // Green for selected seats

    switch (seat.status) {
      case SeatStatus.Booked:
        return theme.palette.grey[700]; // Dark grey for booked seats
      case SeatStatus.Unavailable:
        return theme.palette.grey[400]; // Light grey for unavailable seats
      case SeatStatus.Available:
        switch (seat.type) {
          case 'VIP':
            return theme.palette.secondary.main; // Purple for VIP
          case 'COUPLE':
            return theme.palette.error.light; // Pink/light red for Couple
          case 'SWEETBOX':
            return '#ff9800'; // Orange for Sweetbox
          case 'REGULAR':
          default:
            return theme.palette.primary.main; // Blue for regular seats
        }
      default:
        return theme.palette.grey[500]; // Fallback
    }
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ghế');
      return;
    }

    // Get seat labels
    const seatLabels = selectedSeats.map(seatId => {
      for (const row of seatLayout) {
        const seat = row.find(s => s.id === seatId);
        if (seat) {
          return `${seat.row}${seat.number}`;
        }
      }
      return "";
    }).filter(label => label !== "");

    // Here we would navigate to the payment page
    // For now, just show a success message
    toast.success('Đặt ghế thành công: ' + seatLabels.join(', '));
    
    // Navigate to a hypothetical payment confirmation page
    if (movieId) {
      navigate(`/booking-confirmation/${showtimeId}`, {
        state: {
          selectedSeats: seatLabels,
          totalPrice: calculateTotalPrice(),
          showtimeInfo,
          movieId
        }
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button */}
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Quay lại phim
      </Button>
      
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Chọn Ghế Ngồi
        </Typography>
        {showtimeInfo && (
          <Box mt={1}>
            <Typography variant="h6" color="textSecondary">
              {showtimeInfo.movieName}
            </Typography>
            <Typography variant="body1">
              {showtimeInfo.branchName} | {showtimeInfo.roomName} | {showtimeInfo.scheduleTime} | {showtimeInfo.scheduleDate}
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Main content - Only show if authenticated */}
      {isAuthenticated ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper sx={{ p: 3, width: '100%' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={5}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <>
                {/* Screen Line */}
                <Box 
                  sx={{ 
                    width: '80%', 
                    maxWidth: '500px',
                    height: '20px', 
                    backgroundColor: theme.palette.grey[300],
                    mb: 5, 
                    mx: 'auto',
                    textAlign: 'center', 
                    lineHeight: '20px',
                    borderRadius: '3px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography variant="caption" color="textSecondary">MÀN HÌNH</Typography>
                </Box>
                
                {/* Seat Layout */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, overflowX: 'auto' }}>
                  <Box sx={{ display: 'inline-block' }}>
                    {seatLayout.map((row, rowIndex) => (
                      <Box key={rowIndex} sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <Typography sx={{ mr: 2, width: '20px', textAlign: 'center', alignSelf: 'center', fontWeight: 'bold' }}>
                          {row[0]?.row}
                        </Typography>
                        {row.map((seat) => {
                          const isSelected = selectedSeats.includes(seat.id);
                          const seatColor = getSeatColors(seat);
                          const isDisabled = seat.status === SeatStatus.Booked || seat.status === SeatStatus.Unavailable;

                          return (
                            <Tooltip 
                              title={
                                isDisabled 
                                  ? `Ghế ${seat.row}${seat.number} không khả dụng`
                                  : `${seat.row}${seat.number} - ${seat.price.toLocaleString('vi-VN')}đ`
                              } 
                              key={seat.id}
                              arrow
                              placement="top"
                            >
                              <Box
                                onClick={() => !isDisabled && handleSeatSelection(seat)}
                                sx={{
                                  width: { xs: 28, sm: 32, md: 36 },
                                  height: { xs: 28, sm: 32, md: 36 },
                                  m: 0.5,
                                  backgroundColor: seatColor,
                                  color: theme.palette.getContrastText(seatColor),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '4px',
                                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                                  opacity: isDisabled ? 0.6 : 1,
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  fontWeight: 'bold',
                                  transition: 'transform 0.1s ease-in-out, background-color 0.2s',
                                  '&:hover': {
                                    transform: !isDisabled ? 'scale(1.1)' : 'none',
                                    boxShadow: !isDisabled ? theme.shadows[3] : 'none',
                                  },
                                  ...(seat.type === 'AISLE' && {
                                    backgroundColor: 'transparent',
                                    border: `1px dashed ${theme.palette.grey[400]}`,
                                    cursor: 'default',
                                  })
                                }}
                              >
                                {seat.type !== 'AISLE' ? seat.number : ''}
                              </Box>
                            </Tooltip>
                          );
                        })}
                      </Box>
                    ))}
                  </Box>
                </Box>
                
                {/* Legend */}
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, p:1, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                  {[
                    { type: 'REGULAR', label: 'Ghế thường', status: SeatStatus.Available },
                    { type: 'VIP', label: 'Ghế VIP', status: SeatStatus.Available },
                    { type: 'COUPLE', label: 'Ghế đôi', status: SeatStatus.Available },
                    { type: 'SELECTED', label: 'Ghế đã chọn', status: SeatStatus.Selected },
                    { type: 'BOOKED', label: 'Ghế đã đặt', status: SeatStatus.Booked },
                    { type: 'UNAVAILABLE', label: 'Không khả dụng', status: SeatStatus.Unavailable },
                  ].map(item => (
                    <Box key={item.label} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          backgroundColor: getSeatColors({ type: item.type as any, status: item.status } as Seat), 
                          mr: 1, 
                          borderRadius: '3px',
                          border: item.type === 'AISLE' ? `1px dashed ${theme.palette.grey[400]}` : 'none',
                        }} 
                      />
                      <Typography variant="caption">{item.label}</Typography>
                    </Box>
                  ))}
                </Box>
                
                {/* Summary and Action */}
                <Box sx={{ mt: 4, p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Ghế đã chọn ({selectedSeats.length}):
                        </Typography>
                        <Typography>
                          {selectedSeats.map(seatId => {
                            for (const row of seatLayout) {
                              const seat = row.find(s => s.id === seatId);
                              if (seat) {
                                return `${seat.row}${seat.number}`;
                              }
                            }
                            return "";
                          }).filter(label => label !== "").join(', ') || 'Chưa chọn ghế nào'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Tổng tiền:
                        </Typography>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {calculateTotalPrice().toLocaleString('vi-VN')}đ
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="large"
                        disabled={selectedSeats.length === 0}
                        onClick={handleProceedToPayment}
                        sx={{ 
                          px: 4, 
                          py: 1.5,
                          borderRadius: '8px',
                          background: theme.palette.primary.main,
                          '&:hover': {
                            background: theme.palette.primary.dark,
                          }
                        }}
                      >
                        Tiếp tục thanh toán
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      ) : (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Vui lòng đăng nhập để chọn ghế.
        </Alert>
      )}
    </Container>
  );
};

export default SeatSelectionPage; 