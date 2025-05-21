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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

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

// Mock combo data
const comboList = [
  {
    id: 'combo1',
    name: 'Beta Combo 69oz',
    price: 68000,
    description: 'TIẾT KIỆM 28K!!! Gồm: 1 Bắp (69oz) + 1 Nước có gaz (22oz)',
    image: 'https://i.imgur.com/0Q9QZbK.png', // Example image
  },
  {
    id: 'combo2',
    name: 'Sweet Combo 69oz',
    price: 88000,
    description: 'TIẾT KIỆM 46K!!! Gồm: 1 Bắp (69oz) + 2 Nước có gaz (22oz)',
    image: 'https://i.imgur.com/0Q9QZbK.png', // Example image
  },
];

const SeatSelectionPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  console.log(location.state);
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
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [selectedCombos, setSelectedCombos] = useState<{ [id: string]: number }>({});
  const [timer, setTimer] = useState<number>(600); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  
  // Get authentication state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Thêm hàm để lưu ghế đã đặt vào localStorage
  const saveBookedSeats = (seatsToSave: string[]) => {
    try {
      // Lấy dữ liệu đã lưu trước đó (nếu có)
      const savedBookingsString = localStorage.getItem('bookedSeats');
      let savedBookings: Record<string, string[]> = {};
      
      if (savedBookingsString) {
        savedBookings = JSON.parse(savedBookingsString);
      }
      
      // Lưu thông tin ghế đã đặt theo showtimeId
      savedBookings[showtimeId as string] = seatsToSave;
      localStorage.setItem('bookedSeats', JSON.stringify(savedBookings));
      
      console.log(`Đã lưu ${seatsToSave.length} ghế cho showtime ${showtimeId}`);
    } catch (err) {
      console.error('Lỗi khi lưu thông tin ghế đã đặt:', err);
    }
  };
  
  // Thêm hàm để lấy ghế đã đặt từ localStorage
  const getBookedSeats = (): string[] => {
    try {
      const savedBookingsString = localStorage.getItem('bookedSeats');
      if (!savedBookingsString) return [];
      
      const savedBookings: Record<string, string[]> = JSON.parse(savedBookingsString);
      return savedBookings[showtimeId as string] || [];
    } catch (err) {
      console.error('Lỗi khi lấy thông tin ghế đã đặt:', err);
      return [];
    }
  };

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
        
        // Sử dụng dữ liệu từ location.state thay vì gọi API bị lỗi
        if (location.state) {
          // Kiểm tra xem tất cả thuộc tính cần thiết có tồn tại không
          if (!location.state.branchName || !location.state.movieName) {
            console.warn("Missing required state properties. Using fallback values.");
          }
          
          setShowtimeInfo({
            scheduleId: parseInt(showtimeId),
            roomId: location.state.roomId || 0,
            roomName: location.state.roomName || "Phòng chiếu",
            branchName: location.state.branchName || "Rạp chiếu",
            movieName: location.state.movieName || "Phim",
            scheduleTime: location.state.scheduleTime || "",
            scheduleDate: location.state.selectedDate || selectedDate || ""
          });
          
          console.log("Using showtime info from location state:", {
            branchName: location.state.branchName,
            movieName: location.state.movieName,
            roomName: location.state.roomName,
            scheduleTime: location.state.scheduleTime
          });
        } else {
          console.warn("No location state available. Using default values.");
          setShowtimeInfo({
            scheduleId: parseInt(showtimeId),
            roomId: 0,
            roomName: "Phòng chiếu",
            branchName: "Rạp chiếu",
            movieName: "Phim",
            scheduleTime: "",
            scheduleDate: selectedDate || ""
          });
        }
        
        // Lấy danh sách ghế đã đặt từ localStorage
        const previouslyBookedSeats = getBookedSeats();
        console.log(`Đã tìm thấy ${previouslyBookedSeats.length} ghế đã đặt trước đó cho showtime ${showtimeId}`);
        
        // *** MOCK SEAT LAYOUT DATA WITH TYPES AND PRICES ***
        // Hàm tạo số ngẫu nhiên giả định từ seed (showtimeId) để đảm bảo tính ổn định
        const seededRandom = (min: number, max: number, seed: number, index: number) => {
          const seedValue = seed * (index + 1);
          // Tạo số ngẫu nhiên giả định từ seedValue
          const x = Math.sin(seedValue) * 10000;
          const random = x - Math.floor(x);
          // Map to range
          return min + random * (max - min);
        };
        
        const showtimeIdNum = parseInt(showtimeId);
        const mockSeatsFromAPI: Seat[] = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const seatsPerRow = 12;
        let idCounter = 1;

        // Danh sách ID ghế mới tạo để so sánh với ghế đã đặt trước đó
        const newSeatIds: string[] = [];

        rows.forEach((row, rowIndex) => {
          for (let i = 1; i <= seatsPerRow; i++) {
            const seatIndex = (rowIndex * seatsPerRow) + i;
            let status = SeatStatus.Available;
            let type: Seat['type'] = 'REGULAR';
            let price = 70000; // Default price

            // Tạo ID ghế
            const seatId = `seat-${row}${i}-${idCounter++}`;
            newSeatIds.push(seatId);

            // Xác định trạng thái ghế một cách ổn định dựa trên showtimeId và vị trí ghế
            const randomValue1 = seededRandom(0, 1, showtimeIdNum, seatIndex);
            const randomValue2 = seededRandom(0, 1, showtimeIdNum, seatIndex + 100);
            
            // Đảm bảo một số ghế đã được đặt trước
            if (randomValue1 < 0.2) status = SeatStatus.Booked;
            // Đảm bảo một số ghế không khả dụng (ví dụ: lối đi, ghế hỏng)
            if (randomValue2 < 0.05 && status === SeatStatus.Available) status = SeatStatus.Unavailable;

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
            
            // Nếu ghế này có trong danh sách đã đặt trước đó, cập nhật trạng thái
            if (previouslyBookedSeats.includes(seatId)) {
              status = SeatStatus.Booked;
            }

            mockSeatsFromAPI.push({
              id: seatId,
              row,
              number: i,
              status,
              type,
              price
            });
          }
        });

        // Cập nhật danh sách ghế đã đặt để loại bỏ những ID không còn tồn tại
        const validBookedSeats = previouslyBookedSeats.filter(id => newSeatIds.includes(id));
        if (validBookedSeats.length !== previouslyBookedSeats.length) {
          saveBookedSeats(validBookedSeats);
        }

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

  // On mount, restore selectedCombos from location.state if present, otherwise from localStorage
  useEffect(() => {
    let restoredCombos = {};
    if (location.state && location.state.selectedCombos) {
      restoredCombos = location.state.selectedCombos;
    } else {
      restoredCombos = JSON.parse(localStorage.getItem('selectedCombos') || '{}');
    }
    setSelectedCombos(restoredCombos);

    const savedSeats = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
    const savedTimer = parseInt(localStorage.getItem('seatTimer') || '600', 10);
    const savedActive = localStorage.getItem('seatTimerActive') === '1';
    if (savedSeats.length > 0) {
      setSelectedSeats(savedSeats);
      setTimer(savedTimer);
      setTimerActive(savedActive);
    }
  }, []);

  // Save selectedSeats, timer, and selectedCombos to localStorage on change
  useEffect(() => {
    localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    localStorage.setItem('seatTimer', timer.toString());
    localStorage.setItem('seatTimerActive', timerActive ? '1' : '0');
    localStorage.setItem('selectedCombos', JSON.stringify(selectedCombos));
  }, [selectedSeats, timer, timerActive, selectedCombos]);

  // Start timer when first seat is selected, reset if all seats are cleared
  useEffect(() => {
    if (selectedSeats.length > 0 && !timerActive) {
      setTimerActive(true);
    }
    if (selectedSeats.length === 0 && timerActive) {
      setTimerActive(false);
      setTimer(600);
    }
  }, [selectedSeats]);

  // Countdown effect
  useEffect(() => {
    if (!timerActive) return;
    if (timer === 0) {
      setSelectedSeats([]);
      setTimerActive(false);
      setTimer(600);
      toast.error('Hết thời gian giữ ghế. Vui lòng chọn lại!');
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timer]);

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

  const handleComboChange = (id: string, delta: number) => {
    setSelectedCombos(prev => {
      const newValue = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: newValue };
    });
  };

  // Calculate comboTotal for ComboModal rendering
  const comboTotal = Object.entries(selectedCombos).reduce(
    (sum, [id, qty]) => sum + (comboList.find(c => c.id === id)?.price || 0) * qty,
    0
  );

  const handleProceedToPaymentWithCombo = () => {
    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ghế');
      return;
    }

    // Calculate combo total here!
    const ticketTotal = calculateTotalPrice();
    const total = ticketTotal + comboTotal;

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

    // Do NOT save booked seats here!
    // saveBookedSeats(selectedSeats);

    // Proceed to confirmation page, pass combo info
    console.log(movieId);
    if (movieId) {
      navigate(`/booking-confirmation/${showtimeId}`, {
        state: {
          selectedSeats: seatLabels,
          totalPrice: total,
          showtimeInfo,
          movieId,
          selectedCombos,
          comboTotal,
          ticketTotal,
        }
      });
    }
  };

  const ComboModal = (
    <Dialog
      open={comboModalOpen}
      onClose={() => setComboModalOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: 8,
          background: 'linear-gradient(135deg, #fff 80%, #ffe0f7 100%)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          fontSize: 24,
          textAlign: 'center',
          color: '#d81b60',
          letterSpacing: 1,
          pb: 1,
        }}
      >
        Combo - Bắp nước
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: 1, pb: 2 }}>
        {comboList.map(combo => (
          <Box
            key={combo.id}
            display="flex"
            alignItems="center"
            mb={2}
            sx={{
              background: '#fff',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(216,27,96,0.08)',
              p: 2,
              transition: 'box-shadow 0.2s',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(216,27,96,0.15)',
              },
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                mr: 2,
                flexShrink: 0,
                background: '#f8bbd0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={combo.image}
                alt={combo.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography fontWeight="bold" fontSize={18} color="#ad1457" noWrap>
                {combo.name} - {combo.price.toLocaleString('vi-VN')}đ
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {combo.description}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" ml={2}>
              <IconButton
                onClick={() => handleComboChange(combo.id, -1)}
                sx={{
                  color: '#d81b60',
                  border: '1px solid #f8bbd0',
                  background: '#fff',
                  '&:hover': { background: '#fce4ec' },
                  mx: 0.5,
                }}
                size="small"
              >
                <RemoveIcon />
              </IconButton>
              <Typography
                sx={{
                  minWidth: 28,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#d81b60',
                  fontSize: 18,
                  mx: 0.5,
                  borderRadius: 1,
                  background: selectedCombos[combo.id] ? '#f8bbd0' : '#f3e5f5',
                  px: 1,
                  py: 0.2,
                  boxShadow: selectedCombos[combo.id] ? '0 1px 4px #f06292' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {selectedCombos[combo.id] || 0}
              </Typography>
              <IconButton
                onClick={() => handleComboChange(combo.id, 1)}
                sx={{
                  color: '#d81b60',
                  border: '1px solid #f8bbd0',
                  background: '#fff',
                  '&:hover': { background: '#fce4ec' },
                  mx: 0.5,
                }}
                size="small"
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: 'space-between',
          px: 4,
          pb: 3,
          pt: 2,
          background: 'linear-gradient(90deg, #fff, #fce4ec 80%)',
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        <Typography fontWeight="bold" fontSize={18} color="#ad1457">
          Tổng cộng: {comboTotal.toLocaleString('vi-VN')}đ
        </Typography>
        <Button
          variant="contained"
          sx={{
            background: 'linear-gradient(90deg, #d81b60 60%, #f06292 100%)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 18,
            px: 4,
            py: 1.2,
            borderRadius: 3,
            boxShadow: '0 2px 8px #f06292',
            '&:hover': {
              background: 'linear-gradient(90deg, #ad1457 60%, #f06292 100%)',
            },
          }}
          onClick={() => {
            setComboModalOpen(false);
            handleProceedToPaymentWithCombo();
          }}
        >
          Tiếp tục
        </Button>
      </DialogActions>
    </Dialog>
  );

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
                
                {/* Timer */}
                {timerActive && (
                  <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography color="error" fontWeight="bold">
                      Thời gian giữ ghế: {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
                    </Typography>
                  </Box>
                )}
                
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
                        onClick={() => setComboModalOpen(true)}
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
      {ComboModal}
    </Container>
  );
};

export default SeatSelectionPage; 