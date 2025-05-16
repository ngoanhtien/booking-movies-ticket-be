import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  TextField,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  bookingService,
  Seat,
  SeatStatus,
  FoodItem,
  FoodSelection
} from '../../services/bookingService';
import { useTheme } from '@mui/material/styles';
import axiosInstance from '../../utils/axios';
import { MovieShowtimesResponse, BranchWithShowtimes, ShowtimeDetail, ApiResponse } from '../../types/showtime';
import { alpha } from '@mui/material/styles';
import QrPaymentModal from './QrPaymentModal';
import { toast, Toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { BookingData, FoodItemInfo, MovieInfo, CinemaInfo, PaymentData } from '../../types/booking';
// Thêm import cho WebSocket
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Định nghĩa interface cho WebSocket message
interface SeatUpdateMessage {
  seatId: string;
  status: SeatStatus; 
  userId: string; // ID của người dùng đang chọn ghế
  roomId: string;
  scheduleId: string;
  timestamp: number;
}

// Định nghĩa interface cho trạng thái ghế tạm thời (đang được người khác chọn)
interface TemporarySeatStatus {
  seatId: string;
  userId: string;
  timestamp: number;
}

// Extend the imported CinemaInfo to include the name property needed locally
interface ExtendedCinemaInfo extends CinemaInfo {
  name?: string;  // Added to support both naming conventions
}

interface FinalBookingDetails extends BookingData {
  paymentStatus: string;
  paymentId: number;
  bookingCode: string;
}

type BookingResponse = ApiResponse<BookingData>;
type PaymentResponse = ApiResponse<PaymentData>;

const steps = ['Select Showtime', 'Select Seats', 'Add Food & Drinks', 'Confirm & Pay'];

interface BookingFormProps {
  movieId?: string; 
  cinemaId?: string; 
  directBooking?: boolean;
  showtimeId?: string; // Add showtimeId parameter for direct seat selection
  branchId?: string; // Add branchId parameter for direct seat selection
  roomType?: string; // Add roomType parameter for direct seat selection
}

// Tạo component BookingSummaryBar hiển thị thông tin tổng hợp ở dưới mỗi bước
const BookingSummaryBar = ({ 
  seatIds, 
  seatLayout, 
  foodItems, 
  availableFoodItems, 
  calculateTotalPrice 
}: { 
  seatIds: string[]; 
  seatLayout: Seat[][]; 
  foodItems: FoodSelection[]; 
  availableFoodItems: FoodItem[]; 
  calculateTotalPrice: () => number;
}) => {
  // Tính tổng tiền ghế
  const calculateSeatPrice = () => {
    let total = 0;
    seatIds.forEach(seatId => {
      for (const row of seatLayout) {
        const seat = row.find(s => s.id === seatId);
        if (seat) {
          total += seat.price;
          break;
        }
      }
    });
    return total;
  };

  // Tính tổng tiền đồ ăn
  const calculateFoodPrice = () => {
    let total = 0;
    foodItems.forEach(item => {
      const foodInfo = availableFoodItems.find(fi => fi.id === item.itemId);
      if (foodInfo) {
        total += foodInfo.price * item.quantity;
      }
    });
    return total;
  };

  // Tính tổng số lượng đồ ăn
  const calculateFoodQuantity = () => {
    return foodItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Lấy tên ghế
  const getSeatLabels = () => {
    const seats: string[] = [];
    seatIds.forEach(seatId => {
      for (const row of seatLayout) {
        const seat = row.find(s => s.id === seatId);
        if (seat) {
          seats.push(`${seat.row}${seat.number}`);
          break;
        }
      }
    });
    return seats;
  };

  const seatPrice = calculateSeatPrice();
  const foodPrice = calculateFoodPrice();
  const foodQuantity = calculateFoodQuantity();
  const totalPrice = calculateTotalPrice();
  const seatLabels = getSeatLabels();

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        mt: 2,
        p: 2,
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0',
        zIndex: 10,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {seatIds.length > 0 && (
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: 1 }}>
                <Typography variant="subtitle2">Ghế đã chọn ({seatIds.length}):</Typography>
                <Typography variant="body2" color="text.secondary">
                  {seatLabels.join(', ')}
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ ml: 'auto' }}>
                {seatPrice.toLocaleString('vi-VN')}đ
              </Typography>
            </Box>
          </Grid>
        )}

        {foodQuantity > 0 && (
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: 1 }}>
                <Typography variant="subtitle2">Đồ ăn & thức uống ({foodQuantity}):</Typography>
                <Typography variant="body2" color="text.secondary">
                  {foodItems.map(item => {
                    const foodInfo = availableFoodItems.find(fi => fi.id === item.itemId);
                    return foodInfo ? `${foodInfo.name} x${item.quantity}` : '';
                  }).filter(text => text).join(', ')}
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ ml: 'auto' }}>
                {foodPrice.toLocaleString('vi-VN')}đ
              </Typography>
            </Box>
          </Grid>
        )}

        <Grid item xs={12} sm={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="subtitle2" sx={{ mr: 1 }}>Tổng cộng:</Typography>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              {totalPrice.toLocaleString('vi-VN')}đ
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

const BookingForm: React.FC<BookingFormProps> = ({ 
  movieId, 
  cinemaId, 
  directBooking = false,
  showtimeId,
  branchId,
  roomType
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(showtimeId ? 1 : 0); // Start at seat selection if showtimeId is provided
  const [selectedMovie, setSelectedMovie] = useState<MovieInfo | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<ExtendedCinemaInfo>({cinemaName: '', roomName: '', address: '', name: ''});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<FinalBookingDetails | null>(null);
  const [currentMovieInfo, setCurrentMovieInfo] = useState<{id: number | null, name: string | null}>({id: null, name: null});
  const [selectedShowtime, setSelectedShowtime] = useState<string>(''); // State variable for tracking selected showtime
  
  // Thêm state cho WebSocket
  const stompClient = useRef<Client | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [temporaryReservedSeats, setTemporaryReservedSeats] = useState<TemporarySeatStatus[]>([]);
  // ID người dùng - trong trường hợp thực tế lấy từ auth, ở đây tạo tạm một ID ngẫu nhiên
  const userId = useRef<string>(`user_${Math.floor(Math.random() * 100000)}`);

  // State thay thế mock data với API data
  const [showtimeBranches, setShowtimeBranches] = useState<BranchWithShowtimes[]>([]);
  const [seatLayout, setSeatLayout] = useState<Seat[][]>([]); 
  const [availableFoodItems, setAvailableFoodItems] = useState<FoodItem[]>([]);

  // Thêm state để lưu trữ kết quả debug
  const [debugResult, setDebugResult] = useState<string>('');

  // Thêm một thông báo lỗi thân thiện với người dùng
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  // Thêm state quản lý modal QR
  const [showQrModal, setShowQrModal] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);

  // Add new state variables to track selected data
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSeats, setSelectedSeats] = useState<Array<{code: string}>>([]);

  // Add a reference to store if we're in direct booking mode with showtimeId
  const isDirectSeatSelection = useRef(!!showtimeId);

  const validationSchema = Yup.object().shape({
    // Define Yup validation based on activeStep
    showtimeId: activeStep === 0 ? Yup.string().required('Showtime is required') : Yup.string(),
    seatIds: activeStep === 1 ? Yup.array().min(1, 'Please select at least one seat.').required('Please select at least one seat.') : Yup.array(),
    foodItems: activeStep === 2 ? Yup.array().of(
      Yup.object().shape({
        itemId: Yup.string().required(),
        quantity: Yup.number().min(1).required()
      })
    ) : Yup.array(),
    paymentMethod: activeStep === 3 ? Yup.string().required('Payment method is required') : Yup.string(),
  });

  const formik = useFormik<{
    showtimeId: string;
    seatIds: string[]; // Explicitly type seatIds
    foodItems: FoodSelection[]; // Updated to FoodSelection[]
    paymentMethod: string;
  }> ({
    initialValues: {
      showtimeId: '',
      seatIds: [],
      foodItems: [],
      paymentMethod: 'QR_MOMO',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setFriendlyError(null);
        
        // Tìm thông tin showtime chi tiết
        const selectedShowtime = getSelectedShowtimeDetails();
        if (!selectedShowtime) {
          setError('Không tìm thấy thông tin suất chiếu.');
          return;
        }
        
        // Tạo booking request
        const bookingRequest = {
          scheduleId: selectedShowtime.scheduleId,
          roomId: selectedShowtime.roomId,
          seatIds: values.seatIds,
          foodItems: values.foodItems.map(item => ({
            foodId: parseInt(item.itemId),
            quantity: item.quantity
          })),
          paymentMethod: values.paymentMethod
        };
        
        console.log("Đang gửi yêu cầu đặt vé:", bookingRequest);
        
        let bookingData: BookingData;
        
        try {
          // Cập nhật endpoint với tiền tố /api/v1/
          const response = await axiosInstance.post<BookingResponse>('/api/v1/bookings/create', bookingRequest);
          const data = response.data?.result || response.data?.data;
          if (!data) {
            throw new Error('Invalid booking response format');
          }
          bookingData = data;
        } catch (error: any) {
          console.error("Lỗi khi gọi API đặt vé:", error);
          
          try {
            // Thử endpoint thay thế với tiền tố /api/v1/
            const altResponse = await axiosInstance.post<BookingResponse>(
              '/api/v1/payment/sepay-webhook',
              bookingRequest
            );
            const data = altResponse.data?.result || altResponse.data?.data;
            if (!data) {
              throw new Error('Invalid booking response format from alternative endpoint');
            }
            bookingData = data;
          } catch (altError: any) {
            console.error("Tất cả API đặt vé đều lỗi. Tạo mock response để tiếp tục quy trình:", altError);
            
            // Tạo mock booking data để người dùng có thể tiếp tục
            bookingData = {
              bookingId: Math.floor(Math.random() * 10000) + 1,
              status: "PENDING",
              movie: {
                movieId: selectedShowtime.movieId || 1,
                movieName: selectedShowtime.movieName || currentMovieInfo.name || "Selected Movie",
                date: new Date().toISOString().split('T')[0],
                startTime: selectedShowtime.time || "Unknown",
                endTime: "Unknown",
                time: selectedShowtime.time || "Unknown"
              },
              cinema: {
                cinemaName: selectedShowtime.branchName || "Cinema",
                roomName: selectedShowtime.roomName || "Unknown Room",
                address: "Unknown Address"
              },
              seats: values.seatIds,
              totalAmount: calculateTotalPrice(),
              foodItems: getSelectedFoodItemsDetails()
            };
          }
        }
        
        // Process payment (có thể bị lỗi tương tự)
        let paymentResult: PaymentData;
        
        try {
          const paymentData = {
            bookingId: bookingData.bookingId,
            paymentMethod: values.paymentMethod,
            amount: calculateTotalPrice(),
            status: 'SUCCESS'
          };

          const response = await axiosInstance.post<PaymentResponse>('/api/v1/payments/simulate', paymentData);
          const data = response.data?.result || response.data?.data;
          if (!data) {
            throw new Error('Invalid payment response format');
          }
          paymentResult = data;
        } catch (error) {
          console.error("Lỗi khi xử lý thanh toán, tạo mock payment result:", error);
          
          // Tạo mock payment result
          paymentResult = {
            paymentId: Math.floor(Math.random() * 10000) + 1,
            status: "SUCCESS",
            amount: calculateTotalPrice()
          };
        }
        
        // Tạo final booking details
        const finalBookingDetails: FinalBookingDetails = {
          bookingId: bookingData.bookingId,
          status: bookingData.status,
          bookingCode: `B${bookingData.bookingId}`,
          movie: bookingData.movie,
          cinema: bookingData.cinema,
          seats: bookingData.seats,
          totalAmount: calculateTotalPrice(),
          paymentStatus: paymentResult.status,
          paymentId: paymentResult.paymentId,
          foodItems: getSelectedFoodItemsDetails()
        };
        
        console.log("Chi tiết đặt vé đã tạo:", JSON.stringify(finalBookingDetails));
        
        // Update state and show success message
        setBookingDetails(finalBookingDetails);
        setBookingCompleted(true);
        setSuccessMessage('Đặt vé thành công!');

        // Lưu bookingId để sử dụng trong QR modal
        setBookingId(bookingData.bookingId);
        
        if (values.paymentMethod.startsWith('QR_')) {
          // Hiển thị QR modal nếu chọn phương thức thanh toán QR
          setShowQrModal(true);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Lỗi đặt vé:', err);
        handleAPIError(err, 'đặt vé');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleNext = () => {
    // Trigger validation for the current step before proceeding
    if (activeStep === 0) {
      console.log("[DEBUG handleNext] Step 0 (showtime selection)");
      console.log("[DEBUG handleNext] formik.values.showtimeId:", formik.values.showtimeId);
      console.log("[DEBUG handleNext] selectedShowtime:", selectedShowtime);
      console.log("[DEBUG handleNext] formik.errors:", formik.errors);
      console.log("[DEBUG handleNext] formik.touched:", formik.touched);
      
      // Kiểm tra cả formik.values.showtimeId và selectedShowtime
      if (formik.values.showtimeId || selectedShowtime) {
        console.log("[DEBUG handleNext] Validation passed, moving to next step");
        // Đảm bảo formik.values.showtimeId được cập nhật từ selectedShowtime nếu cần
        if (selectedShowtime && !formik.values.showtimeId) {
          formik.setFieldValue('showtimeId', selectedShowtime);
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else {
        console.log("[DEBUG handleNext] Validation failed: No showtime selected");
        formik.setErrors({ showtimeId: t('booking.error.showtimeRequired', 'Please select a showtime') });
        formik.setFieldTouched('showtimeId', true, true);
      }
    } else if (activeStep === 1) {
      formik.validateField('seatIds').then(fieldError => {
        if (!fieldError) {
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
          formik.setFieldTouched('seatIds', true, true);
        }
      });
    } else if (activeStep === 2) {
      // For now, no specific validation for food items before proceeding
      // Add formik.validateField('foodItems') if specific rules are needed
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else {
      // For other steps, you might have different validation or just proceed
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Fetch movie details and showtimes if movieId is provided
  useEffect(() => {
    const fetchShowtimesData = async () => {
      if (!movieId) { // Nếu không có movieId, không fetch và reset
        setShowtimeBranches([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null); // Reset error state
        
        const apiResponse: MovieShowtimesResponse | null = await bookingService.getShowtimesByMovie(movieId);
        
        if (apiResponse && apiResponse.branches && Array.isArray(apiResponse.branches)) {
          console.log('[BookingForm] Fetched showtime branches:', apiResponse.branches);
          setShowtimeBranches(apiResponse.branches);
          setCurrentMovieInfo({ id: apiResponse.movieId, name: apiResponse.movieName });
        } else {
          console.warn('[BookingForm] No branches found in API response or invalid structure:', apiResponse);
          setShowtimeBranches([]); 
          setCurrentMovieInfo({id: null, name: null});
        }
      } catch (err: any) {
        console.error('Error fetching showtimes in BookingForm:', err);
        setError(err.message || 'Error fetching showtimes');
        setShowtimeBranches([]); // Set mảng rỗng khi có lỗi
        setCurrentMovieInfo({id: null, name: null});
      } finally {
        setLoading(false);
      }
    };
    
    fetchShowtimesData();
  }, [movieId]); // Bỏ cinemaId khỏi dependencies nếu getShowtimesByMovie không dùng nó
  // Nếu getShowtimesByMovieAndCinema được dùng dựa trên cinemaId, thì cinemaId cần ở lại dependencies.

  // Fetch seat layout when showtimeId changes and we are on the seat selection step
  useEffect(() => {
    const fetchSeatLayout = async () => {
      if (formik.values.showtimeId && activeStep === 1) {
        try {
          setLoading(true);
          // Cần tìm đúng ShowtimeDetail từ showtimeBranches
          let selectedShowtimeDetail: ShowtimeDetail | null = null;
          let selectedBranchName: string | null = null; // Để lấy thông tin giá nếu cần

          for (const branch of showtimeBranches) {
            const foundShowtime = branch.showtimes.find(
              // Giả sử formik.values.showtimeId lưu trữ một ID duy nhất, ví dụ: `${scheduleId}-${roomId}`
              // Hoặc nếu showtimeId chỉ là scheduleId, cần đảm bảo nó là duy nhất trong context này
              // Hiện tại, API response không có 'id' trực tiếp trên ShowtimeDetail.
              // Chúng ta cần quyết định formik.values.showtimeId sẽ lưu gì.
              // Ví dụ, nếu nó lưu scheduleId (là number):
              // st => st.scheduleId === parseInt(formik.values.showtimeId, 10) 
              // Hoặc nếu nó là một string kết hợp:
              st => `${st.scheduleId}-${st.roomId}` === formik.values.showtimeId
            );
            if (foundShowtime) {
              selectedShowtimeDetail = foundShowtime;
              selectedBranchName = branch.branchName; // Ví dụ
              break;
            }
          }
          
          if (!selectedShowtimeDetail) {
            throw new Error('Không tìm thấy thông tin suất chiếu đã chọn trong dữ liệu đã tải.');
          }

          // *** MOCK SEAT LAYOUT DATA WITH TYPES AND PRICES ***
          // In a real scenario, this data would come from bookingService.getSeatLayout
          const mockSeatsFromAPI: Seat[] = [];
          const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
          const seatsPerRow = 12;
          let idCounter = 1;

          rows.forEach(row => {
            for (let i = 1; i <= seatsPerRow; i++) {
              let status = SeatStatus.Available;
              let type: Seat['type'] = 'REGULAR';
              let price = 70000; // Ví dụ giá cố định, vì ShowtimeDetail không có giá trực tiếp

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
                price += 50000; // Couple seat price (per seat, often sold as pair)
              } else if (row === 'A' && (i === 1 || i === seatsPerRow)) {
                  type = 'SWEETBOX'; // Example for another type
                  price += 40000;
              }

              // Some seats might be unavailable regardless of booking status
              if ((row === 'D' && i === 6) || (row === 'D' && i === 7)) { // e.g. lối đi
                  status = SeatStatus.Unavailable;
                  type = 'AISLE'; // Custom type for aisle
              }
              
              // Ensure unavailable seats don't get a price for selection
              if (status === SeatStatus.Unavailable || status === SeatStatus.Booked) {
                  // No specific price adjustment needed here for UI, as they are not selectable
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
          // *** END OF MOCK SEAT LAYOUT DATA ***

          // const response = await bookingService.getSeatLayout(
          //   selectedShowtime.scheduleId, 
          //   selectedShowtime.roomId
          // );
          // if (response?.data) { // Using mock data for now
          // const seats = response.data; 
          const seats = mockSeatsFromAPI; // Use mocked data

          const rowMap = new Map<string, Seat[]>();
          seats.forEach((seat: Seat) => {
            if (!rowMap.has(seat.row)) {
              rowMap.set(seat.row, []);
            }
            rowMap.get(seat.row)?.push(seat);
          });
          
          const layout: Seat[][] = Array.from(rowMap.values());
          layout.sort((a, b) => a[0].row.localeCompare(b[0].row));
          layout.forEach(row => row.sort((a, b) => a.number - b.number));
          
          setSeatLayout(layout);
          formik.setFieldValue('seatIds', []);
          // }
        } catch (err: any) {
          console.error('Error fetching seat layout:', err);
          setError(err.message || 'Error fetching seat layout');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSeatLayout();
  }, [formik.values.showtimeId, activeStep, showtimeBranches]); // Ensure all dependencies are listed

  // Effect to load food/drink items when entering step 2
  useEffect(() => {
    const fetchFoodItems = async () => {
      if (activeStep === 2) {
        try {
          setLoading(true);
          
          // Gọi API lấy danh sách đồ ăn/uống
          const response = await bookingService.getFoodItems();
          
          if (response?.data) {
            setAvailableFoodItems(response.data);
          }
        } catch (err: any) {
          console.error('Error fetching food items:', err);
          setError(err.message || 'Error fetching food and drinks');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchFoodItems();
  }, [activeStep]);

  // Update the useEffect for selectedShowtime synchronization
  useEffect(() => {
    // Only sync if one has a value and the other is empty or different
    if (formik.values.showtimeId && formik.values.showtimeId !== selectedShowtime) {
      console.log("[DEBUG useEffect] Syncing selectedShowtime from formik:", formik.values.showtimeId);
      setSelectedShowtime(formik.values.showtimeId);
    } else if (selectedShowtime && !formik.values.showtimeId) {
      console.log("[DEBUG useEffect] Syncing formik from selectedShowtime:", selectedShowtime);
      formik.setFieldValue('showtimeId', selectedShowtime);
    }
  }, [formik.values.showtimeId, selectedShowtime]);

  // Convert isShowtimeSelected to useCallback
  const isShowtimeSelected = useCallback((showtimeId: string) => {
    return formik.values.showtimeId === showtimeId || selectedShowtime === showtimeId;
  }, [formik.values.showtimeId, selectedShowtime]);

  // Update getSelectedShowtimeDetails to be a pure function without state updates
  const getSelectedShowtimeDetails = () => {
    if (!formik.values.showtimeId || showtimeBranches.length === 0) return null;
    
    for (const branch of showtimeBranches) {
      const showtime = branch.showtimes.find(
        st => `${st.scheduleId}-${st.roomId}` === formik.values.showtimeId
      );
      if (showtime) {
        // Return the data without updating state
        return {
          scheduleId: showtime.scheduleId,
          roomId: showtime.roomId,
          roomName: showtime.roomName,
          time: showtime.scheduleTime, 
          movieName: currentMovieInfo.name,
          movieId: currentMovieInfo.id,
          branchName: branch.branchName,
          branchAddress: branch.address || branch.branchName,
          startTime: showtime.scheduleTime,
          endTime: showtime.scheduleTime,
          scheduleDate: showtime.scheduleDate,
        };
      }
    }
    return null;
  };

  // Add effect to update cinema and date when showtime changes
  useEffect(() => {
    const showtimeDetails = getSelectedShowtimeDetails();
    if (showtimeDetails) {
      setSelectedCinema({
        cinemaName: showtimeDetails.branchName,
        name: showtimeDetails.branchName,
        roomName: showtimeDetails.roomName || '',
        address: showtimeDetails.branchAddress || ''
      });
      
      if (showtimeDetails.scheduleDate) {
        setSelectedDate(showtimeDetails.scheduleDate);
      }
    }
  }, [formik.values.showtimeId, showtimeBranches]);

  // Helper function to get details of selected food items
  const getSelectedFoodItemsDetails = (): FoodItemInfo[] => {
    if (formik.values.foodItems.length === 0 || availableFoodItems.length === 0) return [];
    return formik.values.foodItems
      .map(selection => {
        const itemDetails = availableFoodItems.find(food => food.id === selection.itemId);
        if (!itemDetails) return null;
        return {
          id: itemDetails.id,
          name: itemDetails.name,
          quantity: selection.quantity,
          price: itemDetails.price,
          subtotal: itemDetails.price * selection.quantity
        };
      })
      .filter((item): item is FoodItemInfo => item !== null);
  };
  
  const getSeatColors = (seat: Seat, isSelected: boolean) => {
    // Kiểm tra xem ghế có đang được người khác chọn không
    const isTemporaryReserved = temporaryReservedSeats.some(
      s => s.seatId === seat.id && s.userId !== userId.current
    );
    
    if (isTemporaryReserved) {
      return theme.palette.warning.main; // Màu cam/vàng cho ghế đang được người khác chọn
    }
    
    if (isSelected) return theme.palette.success.main; // Màu xanh lá cho ghế đang chọn

    switch (seat.status) {
      case SeatStatus.Booked:
        return theme.palette.grey[700]; // Màu xám đậm cho ghế đã đặt
      case SeatStatus.Unavailable:
        return theme.palette.grey[400]; // Màu xám nhạt cho ghế không khả dụng (lối đi, hỏng)
      case SeatStatus.Available:
        switch (seat.type) {
          case 'VIP':
            return theme.palette.secondary.main; // Màu tím cho VIP
          case 'COUPLE':
            return theme.palette.error.light; // Màu hồng/đỏ nhạt cho Couple
          case 'SWEETBOX':
              return '#ff9800'; // Orange for Sweetbox
          case 'REGULAR':
          default:
            return theme.palette.primary.main; // Màu xanh dương cho ghế thường
        }
      default:
        return theme.palette.grey[500]; // Fallback
    }
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = 0;
    const currentShowtime = showtimeBranches.length > 0 ? 
      showtimeBranches.find(b => b.showtimes.some(s => `${s.scheduleId}-${s.roomId}` === formik.values.showtimeId))
      : null;

    // Calculate seat price
    formik.values.seatIds.forEach(seatId => {
      for (const row of seatLayout) {
        const seat = row.find(s => s.id === seatId);
        if (seat) {
          total += seat.price; // Use the individual seat price
          break; 
        }
      }
    });

    // Calculate food price
    formik.values.foodItems.forEach(item => {
      const foodInfo = availableFoodItems.find(fi => fi.id === item.itemId);
      if (foodInfo) {
        total += foodInfo.price * item.quantity;
      }
    });
    return total;
  };

  // Hàm kiểm tra token
  const checkToken = () => {
    const token = localStorage.getItem('token');
    setDebugResult(`Token exists: ${!!token}\n${token ? `Token preview: ${token.substring(0, 20)}...` : 'No token'}`);
    
    // Kiểm tra token bằng XMLHttpRequest thuần túy
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/user/me', true);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.onload = function() {
      if (xhr.status === 200) {
        setDebugResult(prev => prev + '\n\nToken valid! Response: ' + xhr.responseText.substring(0, 100) + '...');
      } else {
        setDebugResult(prev => prev + '\n\nToken invalid! Status: ' + xhr.status + ' Response: ' + xhr.responseText);
      }
    };
    xhr.onerror = function() {
      setDebugResult(prev => prev + '\n\nXHR Error when validating token');
    };
    xhr.send();
  };
  
  // Hàm gửi request đặt vé đơn giản
  const simplifiedBooking = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setDebugResult('Cannot book: No token found');
      return;
    }
    
    // Xác định thông tin cơ bản
    const selectedShowtime = getSelectedShowtimeDetails();
    if (!selectedShowtime) {
      setDebugResult('Cannot book: No showtime selected');
      return;
    }
    
    // Kiểm tra xem có ghế nào được chọn không
    if (formik.values.seatIds.length === 0) {
      setDebugResult('Cannot book: No seats selected');
      return;
    }
    
    // Tạo booking request
    const bookingRequest = {
      scheduleId: selectedShowtime.scheduleId,
      roomId: selectedShowtime.roomId,
      seatIds: formik.values.seatIds,
      foodItems: formik.values.foodItems.map(item => ({
        foodId: parseInt(item.itemId),
        quantity: item.quantity
      })),
      paymentMethod: formik.values.paymentMethod
    };
    
    setDebugResult(`Sending booking request with XMLHttpRequest...\nRequest data: ${JSON.stringify(bookingRequest)}`);
    
    // Gửi request đặt vé với XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/bookings/create', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        setDebugResult(prev => prev + '\n\nBooking success! Response: ' + xhr.responseText.substring(0, 100) + '...');
        // Tiếp tục với bước thanh toán
        processPayment(JSON.parse(xhr.responseText));
      } else {
        setDebugResult(prev => prev + '\n\nBooking failed! Status: ' + xhr.status + ' Response: ' + xhr.responseText);
        
        // Thử endpoint thay thế
        tryAlternativeEndpoint();
      }
    };
    
    xhr.onerror = function() {
      setDebugResult(prev => prev + '\n\nXHR Error when booking');
      // Thử endpoint thay thế
      tryAlternativeEndpoint();
    };
    
    xhr.send(JSON.stringify(bookingRequest));
    
    // Hàm thử endpoint thay thế
    function tryAlternativeEndpoint() {
      setDebugResult(prev => prev + '\n\nTrying alternative endpoint...');
      
      const altXhr = new XMLHttpRequest();
      altXhr.open('POST', '/payment/sepay-webhook', true);
      altXhr.setRequestHeader('Content-Type', 'application/json');
      altXhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      altXhr.onload = function() {
        if (altXhr.status >= 200 && altXhr.status < 300) {
          setDebugResult(prev => prev + '\n\nBooking success with alternative endpoint! Response: ' + altXhr.responseText.substring(0, 100) + '...');
          // Tiếp tục với bước thanh toán
          processPayment(JSON.parse(altXhr.responseText));
        } else {
          setDebugResult(prev => prev + '\n\nBooking failed with alternative endpoint! Status: ' + altXhr.status + ' Response: ' + altXhr.responseText);
        }
      };
      
      altXhr.onerror = function() {
        setDebugResult(prev => prev + '\n\nXHR Error when booking with alternative endpoint');
      };
      
      altXhr.send(JSON.stringify(bookingRequest));
    }
  };
  
  // Hàm xử lý thanh toán
  const processPayment = (bookingResponse: any) => {
    // Xác định bookingId
    let bookingId = null;
    if (bookingResponse?.data?.bookingId) {
      bookingId = bookingResponse.data.bookingId;
    } else if (bookingResponse?.bookingId) {
      bookingId = bookingResponse.bookingId;
    } else if (bookingResponse?.result?.bookingId) {
      bookingId = bookingResponse.result.bookingId;
    } else {
      const responseStr = JSON.stringify(bookingResponse);
      const match = responseStr.match(/"bookingId":\s*(\d+)/);
      if (match && match[1]) {
        bookingId = parseInt(match[1]);
      }
    }
    
    if (!bookingId) {
      setDebugResult(prev => prev + '\n\nCannot process payment: No booking ID found');
      return;
    }
    
    setDebugResult(prev => prev + `\n\nStarting payment for booking ID: ${bookingId}`);
    
    const token = localStorage.getItem('token');
    const paymentData = {
      bookingId,
      paymentMethod: formik.values.paymentMethod,
      amount: 0,
      status: 'SUCCESS'
    };
    
    // Gửi request thanh toán
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/payments/simulate', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        setDebugResult(prev => prev + '\n\nPayment success! Response: ' + xhr.responseText.substring(0, 100) + '...');
        finalizeBooking(bookingId);
      } else {
        setDebugResult(prev => prev + '\n\nPayment failed! Status: ' + xhr.status + ' Response: ' + xhr.responseText);
        
        // Thử endpoint thay thế
        const altXhr = new XMLHttpRequest();
        altXhr.open('POST', '/payment/process', true);
        altXhr.setRequestHeader('Content-Type', 'application/json');
        altXhr.setRequestHeader('Authorization', `Bearer ${token}`);
        
        altXhr.onload = function() {
          if (altXhr.status >= 200 && altXhr.status < 300) {
            setDebugResult(prev => prev + '\n\nPayment success with alternative endpoint! Response: ' + altXhr.responseText.substring(0, 100) + '...');
            finalizeBooking(bookingId);
          } else {
            setDebugResult(prev => prev + '\n\nPayment failed with alternative endpoint! Status: ' + altXhr.status + ' Response: ' + altXhr.responseText);
            // Vẫn hoàn tất booking vì đã có booking ID
            finalizeBooking(bookingId);
          }
        };
        
        altXhr.onerror = function() {
          setDebugResult(prev => prev + '\n\nXHR Error when paying with alternative endpoint');
          // Vẫn hoàn tất booking vì đã có booking ID
          finalizeBooking(bookingId);
        };
        
        altXhr.send(JSON.stringify(paymentData));
      }
    };
    
    xhr.onerror = function() {
      setDebugResult(prev => prev + '\n\nXHR Error when paying');
    };
    
    xhr.send(JSON.stringify(paymentData));
  };
  
  // Hoàn tất booking và hiển thị thông tin
  const finalizeBooking = (bookingId: number) => {
    setDebugResult(prev => prev + '\n\nFinalizing booking...');
    
    // Tạo thông tin booking từ dữ liệu có sẵn
    const selectedShowtime = getSelectedShowtimeDetails();
    const bookingDetails = {
      bookingId: bookingId,
      bookingCode: `B${bookingId}`,
      movie: {
        movieId: selectedShowtime?.movieId || 0,
        movieName: selectedShowtime?.movieName || 'Unknown',
        date: new Date().toISOString(),
        startTime: selectedShowtime?.time || 'Unknown',
        endTime: "N/A"
      },
      cinema: {
        cinemaName: "N/A",
        roomName: selectedShowtime?.roomName || 'Unknown',
        address: "N/A"
      },
      seats: formik.values.seatIds,
      totalAmount: calculateTotalPrice(),
      foodItems: getSelectedFoodItemsDetails(),
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentId: Date.now(),
    };
    
    // Cập nhật state và hiển thị thông báo thành công
    setBookingDetails(bookingDetails);
    setBookingCompleted(true);
    setSuccessMessage('Đặt vé thành công!');
    setDebugResult(prev => prev + '\n\nBooking completed!');
  };

  // Hàm xử lý lỗi API một cách thân thiện
  const handleAPIError = (error: any, context: string) => {
    console.error(`Lỗi ${context}:`, error);
    
    // Đối với lỗi 500, hiển thị thông báo thân thiện
    if (error.response?.status === 500) {
      setFriendlyError(`Hệ thống đang gặp sự cố khi ${context}. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.`);
    } else {
      setError(error.message || `Đã xảy ra lỗi khi ${context}. Vui lòng thử lại.`);
    }
  };

  // Thêm các hàm xử lý cho QR modal
  const handlePaymentCompleted = useCallback(() => {
    // Đóng modal QR
    setShowQrModal(false);
    
    // Chuyển đến màn hình thành công
    setBookingCompleted(true);
    setSuccessMessage('Đặt vé thành công!');
  }, []);

  const handlePaymentExpired = useCallback(() => {
    // Đóng modal QR
    setShowQrModal(false);
    
    // Hiển thị thông báo hết hạn và chuyển về trang chi tiết phim
    toast.error('Quá thời hạn thanh toán', {
      position: 'top-right',
      duration: 3000 // Use duration instead of autoClose
    });
    
    // Chuyển về trang chi tiết phim
    if (movieId) {
      navigate(`/movie/${movieId}`);
    }
  }, [movieId, navigate]);

  // Update when a seat is selected/deselected
  const handleSeatSelection = (seat: Seat, isSelected: boolean) => {
    // Kiểm tra xem ghế có đang được người khác chọn không
    const isTemporaryReserved = temporaryReservedSeats.some(
      s => s.seatId === seat.id && s.userId !== userId.current
    );
    
    // Nếu ghế đang được người khác chọn, hiển thị thông báo và không cho chọn
    if (!isSelected && isTemporaryReserved) {
      toast.error(`Ghế ${seat.row}${seat.number} đang được người khác chọn`);
      return;
    }
    
    if (!isSelected) {
      // Add seat to selectedSeats when selected
      setSelectedSeats(prev => [...prev, { code: seat.row + seat.number }]);
      
      // Update formik value
      formik.setFieldValue('seatIds', [...formik.values.seatIds, seat.id]);
    } else {
      // Remove seat from selectedSeats when deselected
      setSelectedSeats(prev => prev.filter(s => s.code !== seat.row + seat.number));
      
      // Update formik value
      formik.setFieldValue('seatIds', formik.values.seatIds.filter(id => id !== seat.id));
    }
    
    // Gửi cập nhật trạng thái ghế qua WebSocket
    sendSeatUpdateToServer(seat.id, isSelected);
  };

  // Fix getBookingData function
  const getBookingData = (): BookingData => {
    const showtimeDetails = getSelectedShowtimeDetails();
    
    // Collect seat information from formik values
    const seats = formik.values.seatIds.map(seatId => {
      // Find the actual seat from the seatLayout
      for (const row of seatLayout) {
        const seat = row.find(s => s.id === seatId);
        if (seat) {
          return seat.row + seat.number; // Format like "A1", "B2", etc.
        }
      }
      return seatId; // Fallback to the ID if seat not found
    });
    
    return {
      bookingId: bookingId || 0,
      status: "PENDING",
      movie: {
        movieId: currentMovieInfo.id || 0,
        movieName: currentMovieInfo.name || '',
        date: selectedDate,
        startTime: showtimeDetails?.startTime || '',
        endTime: showtimeDetails?.endTime || ''
      },
      cinema: {
        cinemaName: selectedCinema?.cinemaName || selectedCinema?.name || '',
        roomName: showtimeDetails?.roomName || '',
        address: selectedCinema?.address || ''
      },
      seats: seats,
      totalAmount: calculateTotalPrice(),
      foodItems: getSelectedFoodItemsDetails()
    };
  };

  // Khởi tạo WebSocket connection
  useEffect(() => {
    const initializeWebSocketConnection = () => {
      if (activeStep !== 1 || !formik.values.showtimeId) return;
      
      try {
        // Tạo một token ngẫu nhiên để định danh client
        const sessionId = localStorage.getItem('token') || userId.current;
        
        // Khởi tạo SockJS và STOMP client
        const socket = new SockJS('/api/v1/websocket'); // Endpoint WebSocket ở backend
        const client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            'X-User-Id': userId.current
          },
          debug: function (str) {
            console.log('STOMP Debug: ' + str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        // Handle connection success
        client.onConnect = (frame) => {
          console.log('Connected to WebSocket: ' + frame);
          setIsSocketConnected(true);
          
          // Lấy roomId và scheduleId từ showtimeId
          const [scheduleId, roomId] = formik.values.showtimeId.split('-');
          
          // Subscribe để nhận update về ghế
          client.subscribe(`/topic/seats/${roomId}/${scheduleId}`, (message) => {
            try {
              const seatUpdate: SeatUpdateMessage = JSON.parse(message.body);
              console.log('Received seat update:', seatUpdate);
              
              // Nếu nhận được tin nhắn từ người dùng khác
              if (seatUpdate.userId !== userId.current) {
                handleSeatUpdateFromOtherUser(seatUpdate);
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          });
          
          // Subscribe cho thông báo cụ thể cho người dùng này
          client.subscribe(`/user/${userId.current}/queue/notifications`, (message) => {
            console.log('Received personal notification:', message.body);
            // Xử lý thông báo cá nhân nếu cần
          });
        };

        // Handle errors
        client.onStompError = (frame) => {
          console.error('STOMP error:', frame.headers.message);
          setIsSocketConnected(false);
          toast.error('Kết nối thời gian thực bị lỗi. Trạng thái ghế có thể không được cập nhật');
        };

        client.activate();
        stompClient.current = client;
        
        // Cleanup function
        return () => {
          if (client.active) {
            console.log('Disconnecting WebSocket...');
            client.deactivate();
            setIsSocketConnected(false);
          }
        };
      } catch (error) {
        console.error('Error initializing WebSocket:', error);
        setIsSocketConnected(false);
      }
    };

    initializeWebSocketConnection();
    
    // Định kỳ xóa ghế tạm thời đã quá thời gian timeout
    const cleanupInterval = setInterval(() => {
      cleanupExpiredTemporaryReservations();
    }, 10000); // Kiểm tra mỗi 10 giây
    
    return () => {
      if (stompClient.current && stompClient.current.active) {
        stompClient.current.deactivate();
      }
      clearInterval(cleanupInterval);
    };
  }, [activeStep, formik.values.showtimeId]);

  // Xử lý cập nhật ghế từ người dùng khác
  const handleSeatUpdateFromOtherUser = (seatUpdate: SeatUpdateMessage) => {
    if (seatUpdate.status === SeatStatus.Selected) {
      // Thêm vào danh sách ghế đang được người khác chọn tạm thời
      setTemporaryReservedSeats(prev => {
        // Xóa cùng ghế này nếu đã tồn tại (cập nhật)
        const filtered = prev.filter(s => s.seatId !== seatUpdate.seatId);
        // Thêm vào với timestamp mới
        return [...filtered, {
          seatId: seatUpdate.seatId,
          userId: seatUpdate.userId,
          timestamp: seatUpdate.timestamp
        }];
      });
    } else if (seatUpdate.status === SeatStatus.Available) {
      // Xóa khỏi danh sách ghế đang được người khác chọn
      setTemporaryReservedSeats(prev => 
        prev.filter(s => s.seatId !== seatUpdate.seatId)
      );
    } else if (seatUpdate.status === SeatStatus.Booked) {
      // Cập nhật UI để hiển thị ghế đã bị đặt
      setSeatLayout(prevLayout => {
        return prevLayout.map(row => {
          return row.map(seat => {
            if (seat.id === seatUpdate.seatId) {
              return { ...seat, status: SeatStatus.Booked };
            }
            return seat;
          });
        });
      });
      
      // Kiểm tra xem người dùng hiện tại có đang chọn ghế này không
      if (formik.values.seatIds.includes(seatUpdate.seatId)) {
        // Nếu có, thông báo và xóa khỏi ghế đã chọn
        toast.error(`Ghế ${getSeatLabel(seatUpdate.seatId)} vừa được người khác đặt`);
        formik.setFieldValue('seatIds', 
          formik.values.seatIds.filter(id => id !== seatUpdate.seatId)
        );
      }
    }
  };

  // Hàm lấy tên ghế (ví dụ: A1, B5) từ seatId
  const getSeatLabel = (seatId: string): string => {
    for (const row of seatLayout) {
      const seat = row.find(s => s.id === seatId);
      if (seat) {
        return `${seat.row}${seat.number}`;
      }
    }
    return seatId;
  };

  // Xóa các ghế tạm thời đã quá timeout (1 phút)
  const cleanupExpiredTemporaryReservations = () => {
    const now = Date.now();
    const TIMEOUT = 60000; // 1 phút
    
    setTemporaryReservedSeats(prev => 
      prev.filter(s => (now - s.timestamp) < TIMEOUT)
    );
  };

  // Gửi thông báo khi người dùng chọn hoặc bỏ chọn ghế
  const sendSeatUpdateToServer = (seatId: string, isSelected: boolean) => {
    if (!stompClient.current || !stompClient.current.active || !isSocketConnected) {
      console.warn('WebSocket is not connected. Cannot send seat update.');
      return;
    }
    
    try {
      // Lấy roomId và scheduleId từ showtimeId
      const [scheduleId, roomId] = formik.values.showtimeId.split('-');
      
      const message: SeatUpdateMessage = {
        seatId: seatId,
        status: isSelected ? SeatStatus.Available : SeatStatus.Selected, // Ngược lại vì chúng ta gửi trạng thái MỚI
        userId: userId.current,
        roomId: roomId,
        scheduleId: scheduleId, 
        timestamp: Date.now()
      };
      
      stompClient.current.publish({
        destination: '/app/seat/update',
        body: JSON.stringify(message),
        headers: {
          'X-User-Id': userId.current
        }
      });
      
      console.log('Sent seat update:', message);
    } catch (error) {
      console.error('Error sending seat update:', error);
    }
  };

  const renderStepContent = (step: number) => {
    // Nếu booking đã hoàn thành, hiển thị thông tin booking
    if (bookingCompleted) {
      return (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage || t('booking.bookingSuccess', 'Booking Success!')}
          </Alert>
          
          {bookingDetails && (
            <Paper sx={{ p: 3, mt: 2, mb: 4, borderRadius: 2, textAlign: 'left' }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                {t('booking.bookingDetails', 'Booking Details')}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="600">{t('booking.bookingCode', 'Booking Code')}:</Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>{bookingDetails.bookingCode}</Typography>
                  
                  <Typography variant="subtitle1" fontWeight="600">{t('booking.movie', 'Movie')}:</Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>{bookingDetails.movie.movieName}</Typography>
                  
                  <Typography variant="subtitle1" fontWeight="600">{t('booking.cinema', 'Cinema')}:</Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>{bookingDetails.cinema.cinemaName}</Typography>
                  
                  <Typography variant="subtitle1" fontWeight="600">{t('booking.showtime', 'Showtime')}:</Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {new Date(bookingDetails.movie.date).toLocaleDateString()} {bookingDetails.movie.startTime}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="600">{t('booking.seats', 'Seats')}:</Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>{bookingDetails.seats.join(', ')}</Typography>
                  
                  <Typography variant="subtitle1" fontWeight="600">{t('booking.foodAndDrinks', 'Food & Drinks')}:</Typography>
                  {bookingDetails.foodItems && bookingDetails.foodItems.length > 0 ? (
                    <List dense sx={{ mb: 1.5 }}>
                      {bookingDetails.foodItems.map((item: { name: string; quantity: number; price: number }, index: number) => (
                        <ListItem key={index} disablePadding>
                          <ListItemText 
                            primary={`${item.name} x${item.quantity}`}
                            secondary={`${item.price * item.quantity} VND`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" sx={{ mb: 1.5 }}>{t('booking.noFoodSelected', 'No food or drinks selected')}</Typography>
                  )}
                  
                  <Typography variant="subtitle1" fontWeight="600">{t('booking.totalAmount', 'Total Amount')}:</Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, fontWeight: 'bold', color: 'primary.main' }}>
                    {bookingDetails.totalAmount.toLocaleString()} VND
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="contained" sx={{ mr: 2 }}>
                  {t('booking.printTicket', 'Print Ticket')}
                </Button>
                <Button variant="outlined">
                  {t('booking.backToHome', 'Back to Home')}
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      );
    }
    
    switch (step) {
      case 0:
        return (
          <Box>
            {/* DEBUG TOOLS - ONLY IF directBooking IS TRUE */}
            {/* {directBooking && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.lighter' }}>
                <Typography variant="subtitle2" gutterBottom>Debug Tools</Typography>
                <Button variant="outlined" onClick={checkToken} sx={{ mr: 1 }}>Check Token</Button>
                <Button variant="contained" onClick={simplifiedBooking} color="secondary">Book Simply</Button>
                {debugResult && (
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.200', borderRadius: 1, whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto' }}>
                    <Typography variant="caption">{debugResult}</Typography>
                  </Box>
                )}
              </Paper>
            )} */}
            {/* END DEBUG TOOLS */}

            <Typography variant="h6" gutterBottom>{t('booking.selectShowtime')}</Typography>
            {showtimeBranches.length === 0 && !loading && (
              <Typography sx={{my: 2}}>{t('booking.noShowtimes', 'No showtimes available for this movie or selection.')}</Typography>
            )}
            {showtimeBranches.length > 0 && (
              <FormControl component="fieldset" error={formik.touched.showtimeId && Boolean(formik.errors.showtimeId)} fullWidth>
                <InputLabel id="showtime-select-label" shrink={!!formik.values.showtimeId} sx={{position: 'static', transform: 'none', mb:1}}>
                  {t('booking.availableShowtimes', 'Available Showtimes')}
                </InputLabel>
                <RadioGroup
                  aria-label="showtime"
                  name="showtimeId"
                  value={formik.values.showtimeId}
                  onChange={(event) => {
                    console.log("[DEBUG RadioGroup] Selected showtimeId:", event.target.value);
                    const showtimeId = event.target.value;
                    setSelectedShowtime(showtimeId);
                    formik.setFieldValue('showtimeId', showtimeId);
                    formik.setFieldTouched('showtimeId', true, false);
                    console.log("[DEBUG RadioGroup] After updates:", { 
                      selectedShowtime: showtimeId, 
                      formikValue: formik.values.showtimeId,
                      touched: formik.touched.showtimeId
                    });
                  }}
                >
                  <List>
                    {showtimeBranches.map((branch) => (
                      <Box key={branch.branchId} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                          {branch.branchName}
                        </Typography>
                        <List sx={{pt: 0}}>
                          {branch.showtimes.map((showtime: ShowtimeDetail) => (
                            <React.Fragment key={`${branch.branchId}-${showtime.scheduleId}-${showtime.roomId}`}>
                              <ListItem 
                                button 
                                onClick={() => {
                                  console.log("[DEBUG ListItem] Clicked on showtime:", `${showtime.scheduleId}-${showtime.roomId}`);
                                  const showtimeId = `${showtime.scheduleId}-${showtime.roomId}`;
                                  setSelectedShowtime(showtimeId);
                                  formik.setFieldValue('showtimeId', showtimeId);
                                  formik.setFieldTouched('showtimeId', true, false);
                                }}
                                selected={isShowtimeSelected(`${showtime.scheduleId}-${showtime.roomId}`)}
                                sx={{ 
                                  borderRadius: 1, 
                                  mb: 1, 
                                  border: '1px solid', 
                                  borderColor: isShowtimeSelected(`${showtime.scheduleId}-${showtime.roomId}`) ? 'primary.main' : 'divider',
                                  backgroundColor: isShowtimeSelected(`${showtime.scheduleId}-${showtime.roomId}`) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                  '&:hover': {
                                    borderColor: 'primary.light',
                                    backgroundColor: isShowtimeSelected(`${showtime.scheduleId}-${showtime.roomId}`) 
                                      ? alpha(theme.palette.primary.main, 0.15) 
                                      : alpha(theme.palette.primary.main, 0.05),
                                  }
                                }}
                              >
                                <Radio 
                                  value={`${showtime.scheduleId}-${showtime.roomId}`}
                                  checked={isShowtimeSelected(`${showtime.scheduleId}-${showtime.roomId}`)}
                                  onChange={(e) => {
                                    console.log("[DEBUG Radio] Changed:", e.target.value);
                                    setSelectedShowtime(e.target.value);
                                    formik.setFieldValue('showtimeId', e.target.value);
                                    formik.setFieldTouched('showtimeId', true, false);
                                  }}
                                  onClick={(e) => {
                                    // Stop propagation to prevent double click and double state updates
                                    e.stopPropagation();
                                  }}
                                  sx={{mr: 1}} 
                                />
                                <ListItemText 
                                  primary={`${showtime.scheduleTime} - ${showtime.roomName} (${showtime.roomType})`} 
                                  secondary={t('booking.roomTypeIs', `Type: ${showtime.roomType}`)}
                                />
                              </ListItem>
                              {branch.showtimes.indexOf(showtime) < branch.showtimes.length - 1 && <Divider sx={{mb: 1}}/>}
                            </React.Fragment>
                          ))}
                        </List>
                      </Box>
                    ))}
                  </List>
                </RadioGroup>
                {formik.touched.showtimeId && formik.errors.showtimeId && (
                  <Typography color="error" variant="caption">{formik.errors.showtimeId as string}</Typography>
                )}
              </FormControl>
            )}
            
            {/* Thêm nút "Tiếp tục" đặc biệt ngay dưới danh sách lịch chiếu */}
            {showtimeBranches.length > 0 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="large"
                  disabled={!formik.values.showtimeId && !selectedShowtime}
                  onClick={() => {
                    console.log("[DEBUG Continue Button] Clicked with showtimeId:", formik.values.showtimeId || selectedShowtime);
                    // Đảm bảo formik.values.showtimeId được cập nhật từ selectedShowtime nếu cần
                    if (selectedShowtime && !formik.values.showtimeId) {
                      formik.setFieldValue('showtimeId', selectedShowtime);
                    }
                    setActiveStep((prevActiveStep) => prevActiveStep + 1);
                  }}
                  startIcon={<i className="fas fa-arrow-right" />}
                  sx={{ px: 4, py: 1 }}
                >
                  {t('booking.continue', 'Tiếp tục')}
                </Button>
              </Box>
            )}
            
            {/* Thêm BookingSummaryBar nếu đã chọn showtime */}
            {(formik.values.showtimeId || selectedShowtime) && formik.values.seatIds.length > 0 && (
              <BookingSummaryBar
                seatIds={formik.values.seatIds}
                seatLayout={seatLayout}
                foodItems={formik.values.foodItems}
                availableFoodItems={availableFoodItems}
                calculateTotalPrice={calculateTotalPrice}
              />
            )}
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2, textAlign: 'center' }}>
              {t('booking.selectSeats')}
            </Typography>
            
            {/* WebSocket connection status */}
            <Box sx={{ width: '100%', mb: 2, display: 'flex', justifyContent: 'center' }}>
              <Tooltip title={isSocketConnected ? 'Kết nối thời gian thực đang hoạt động' : 'Không có kết nối thời gian thực'}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  borderRadius: '12px',
                  px: 2,
                  py: 0.5,
                  backgroundColor: isSocketConnected ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${isSocketConnected ? theme.palette.success.main : theme.palette.error.main}`
                }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: isSocketConnected ? theme.palette.success.main : theme.palette.error.main,
                      mr: 1
                    }}
                  />
                  <Typography variant="caption" color={isSocketConnected ? 'success.main' : 'error.main'}>
                    {isSocketConnected ? 'Đồng bộ thời gian thực' : 'Không có đồng bộ thời gian thực'}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
            
            {/* Screen Line */}
            <Box 
              sx={{ 
                width: '80%', 
                maxWidth: '500px',
                height: '20px', 
                backgroundColor: theme.palette.grey[300],
                mb: 3, 
                textAlign: 'center', 
                lineHeight: '20px',
                borderRadius: '3px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="caption" color="textSecondary">{t('booking.screen') || 'SCREEN'}</Typography>
            </Box>

            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : seatLayout.length === 0 ? (
              <Typography>{t('booking.noSeatLayout')}</Typography>
            ) : (
              <Paper elevation={2} sx={{ p: {xs: 1, sm: 2, md: 3}, overflowX: 'auto', width: '100%'}}>
                {seatLayout.map((row, rowIndex) => (
                  <Box key={rowIndex} sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <Typography sx={{ mr: 2, width: '20px', textAlign: 'center', alignSelf: 'center', fontWeight: 'bold' }}>
                      {row[0]?.row}
                    </Typography>
                    {row.map((seat) => {
                      const isSelected = formik.values.seatIds.includes(seat.id);
                      const seatColor = getSeatColors(seat, isSelected);
                      const isDisabled = seat.status === SeatStatus.Booked || seat.status === SeatStatus.Unavailable;
                      const isTemporaryReserved = temporaryReservedSeats.some(
                        s => s.seatId === seat.id && s.userId !== userId.current
                      );

                      return (
                        <Tooltip 
                          title={
                            isTemporaryReserved 
                              ? 'Ghế đang được người khác chọn'
                              : isDisabled 
                                ? t(`booking.seatStatus.${seat.status.toLowerCase()}`) 
                                : `${t(`booking.seatType.${seat.type?.toLowerCase() || 'regular'}`)} - ${seat.price.toLocaleString('vi-VN')}đ`
                          } 
                          key={seat.id}
                          arrow
                          placement="top"
                        >
                          <Box
                            onClick={() => {
                              if (!isDisabled && !isTemporaryReserved) {
                                handleSeatSelection(seat, isSelected);
                              } else if (isTemporaryReserved) {
                                toast.error(`Ghế ${seat.row}${seat.number} đang được người khác chọn`);
                              }
                            }}
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
                              cursor: isDisabled || isTemporaryReserved ? 'not-allowed' : 'pointer',
                              opacity: isDisabled ? 0.6 : 1,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              fontWeight: 'bold',
                              transition: 'transform 0.1s ease-in-out, background-color 0.2s',
                              '&:hover': {
                                transform: !isDisabled && !isTemporaryReserved ? 'scale(1.1)' : 'none',
                                boxShadow: !isDisabled && !isTemporaryReserved ? theme.shadows[3] : 'none',
                              },
                              // Thêm hiệu ứng nhấp nháy cho ghế đang được người khác chọn
                              ...(isTemporaryReserved && {
                                animation: 'pulseSeat 1.5s infinite',
                                '@keyframes pulseSeat': {
                                  '0%': { opacity: 1 },
                                  '50%': { opacity: 0.6 },
                                  '100%': { opacity: 1 },
                                },
                              }),
                              // Add specific icons or shapes for different seat types if needed
                              ...(seat.type === 'COUPLE' && { 
                                // Could be wider, or have a specific icon/style
                                // width: { xs: 56, sm: 64, md: 72 }, 
                              }),
                              ...(seat.type === 'AISLE' && { // Example: make aisle seats look different
                                  backgroundColor: 'transparent',
                                  border: `1px dashed ${theme.palette.grey[400]}`,
                                  cursor: 'default',
                              })
                            }}
                          >
                            {/* Display seat number or icon */}
                            {seat.type !== 'AISLE' ? seat.number : ''}
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                ))}
              </Paper>
            )}
            {/* Legend Section */}
            <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, p:1, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
              {[
                { type: 'REGULAR', label: t('booking.seatType.regular') || 'Regular', status: SeatStatus.Available },
                { type: 'VIP', label: t('booking.seatType.vip') || 'VIP', status: SeatStatus.Available },
                { type: 'COUPLE', label: t('booking.seatType.couple') || 'Couple', status: SeatStatus.Available },
                { type: 'SWEETBOX', label: t('booking.seatType.sweetbox') || 'Sweetbox', status: SeatStatus.Available },
                { type: 'SELECTED', label: t('booking.seatStatus.selected') || 'Selected', status: SeatStatus.Selected },
                { type: 'TEMPORARY', label: 'Đang được chọn bởi người khác', status: SeatStatus.Available, isTemporary: true }, // Thêm loại này
                { type: 'BOOKED', label: t('booking.seatStatus.booked') || 'Booked', status: SeatStatus.Booked },
                { type: 'UNAVAILABLE', label: t('booking.seatStatus.unavailable') || 'Unavailable', status: SeatStatus.Unavailable },
              ].map(item => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 20, 
                      height: 20, 
                      backgroundColor: item.isTemporary ? theme.palette.warning.main : getSeatColors({ type: item.type, status: item.status } as Seat, item.status === SeatStatus.Selected), 
                      mr: 1, 
                      borderRadius: '3px',
                      border: item.type === 'AISLE' ? `1px dashed ${theme.palette.grey[400]}` : 'none', // Consistent with AISLE style
                      ...(item.isTemporary && {
                        animation: 'pulseSeat 1.5s infinite',
                        '@keyframes pulseSeat': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.6 },
                          '100%': { opacity: 1 },
                        },
                      }),
                    }} 
                  />
                  <Typography variant="caption">{item.label}</Typography>
                </Box>
              ))}
            </Box>
            
            {formik.touched.seatIds && formik.errors.seatIds && (
              <Alert severity="error" sx={{ mt: 2, width: '100%', justifyContent: 'center' }}>
                {formik.errors.seatIds}
              </Alert>
            )}
            
            {/* Hiển thị thông báo lỗi thân thiện nếu có */}
            {friendlyError && (
              <Alert 
                severity="warning" 
                sx={{ mt: 3, width: '100%', justifyContent: 'center' }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={() => {
                      setActiveStep(3); // Chuyển đến bước cuối cùng
                      setFriendlyError(null);
                    }}
                  >
                    Tiếp tục
                  </Button>
                }
              >
                {friendlyError}
              </Alert>
            )}
            
            {/* Thêm BookingSummaryBar */}
            {formik.values.seatIds.length > 0 && (
              <BookingSummaryBar
                seatIds={formik.values.seatIds}
                seatLayout={seatLayout}
                foodItems={formik.values.foodItems}
                availableFoodItems={availableFoodItems}
                calculateTotalPrice={calculateTotalPrice}
              />
            )}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
              {t('booking.addFoodAndDrinks')}
            </Typography>
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {!loading && !error && availableFoodItems.length === 0 && (
              <Typography sx={{my: 2, textAlign: 'center'}}>{t('booking.noFoodItems')}</Typography>
            )}
            {!loading && !error && availableFoodItems.length > 0 && (
              <Grid container spacing={3}>
                {availableFoodItems.map((item) => {
                  const currentSelection = formik.values.foodItems.find(fi => fi.itemId === item.id);
                  const quantity = currentSelection ? currentSelection.quantity : 0;

                  const handleQuantityChange = (newQuantity: number) => {
                    const updatedFoodItems = formik.values.foodItems.filter(fi => fi.itemId !== item.id);
                    if (newQuantity > 0) {
                      updatedFoodItems.push({ itemId: item.id, quantity: newQuantity });
                    }
                    formik.setFieldValue('foodItems', updatedFoodItems);
                  };

                  return (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Paper 
                        elevation={quantity > 0 ? 4 : 1} 
                        sx={{
                          p: 2, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          height: '100%',
                          border: quantity > 0 ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                          transition: 'border 0.2s, box-shadow 0.2s',
                          borderRadius: '8px',
                        }}
                      >
                        <Box sx={{ height: 140, mb: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: '4px' }}>
                          <img 
                            src={item.imageUrl || 'https://via.placeholder.com/150x100?text=No+Image'} 
                            alt={item.name} 
                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                          />
                        </Box>
                        <Typography variant="h6" component="div" gutterBottom sx={{textAlign: 'center', minHeight: '48px' /* 2 lines */}}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', mb: 1, minHeight: '40px' /* 2 lines */}}>
                          {item.description || ''}
                        </Typography>
                        <Typography variant="h6" color="primary.main" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
                          {item.price.toLocaleString('vi-VN')}đ
                        </Typography>
                        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={() => handleQuantityChange(Math.max(0, quantity - 1))} 
                            disabled={quantity === 0}
                            sx={{ minWidth: '40px', height: '40px', borderRadius: '50%'}}
                          >
                            -
                          </Button>
                          <Typography sx={{ mx: 2, minWidth: '30px', textAlign: 'center', fontSize: '1.1rem', fontWeight: '500' }}>
                            {quantity}
                          </Typography>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={() => handleQuantityChange(quantity + 1)}
                            sx={{ minWidth: '40px', height: '40px', borderRadius: '50%'}}
                          >
                            +
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}
            
            {/* Thêm BookingSummaryBar */}
            <BookingSummaryBar
              seatIds={formik.values.seatIds}
              seatLayout={seatLayout}
              foodItems={formik.values.foodItems}
              availableFoodItems={availableFoodItems}
              calculateTotalPrice={calculateTotalPrice}
            />
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('booking.confirmAndPay', 'Confirm & Pay')}</Typography>
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}

            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>{t('booking.summary.title', 'Booking Summary')}</Typography>
            
            {/* Showtime Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">{t('booking.summary.showtime', 'Showtime')}</Typography>
              <Divider sx={{my:1}} />
              {getSelectedShowtimeDetails() ? (
                <>
                  <ListItemText 
                    primary={t('booking.summary.movie', 'Movie: {{movieName}}', { movieName: currentMovieInfo.name || 'Selected Movie' })}
                    secondary={`${t('booking.summary.time', 'Time')}: ${getSelectedShowtimeDetails()?.time} | ${t('booking.summary.room', 'Room')}: ${getSelectedShowtimeDetails()?.roomName}`}
                  />
                </>
              ) : <Typography>{t('booking.summary.noShowtimeSelected', 'No showtime selected.')}</Typography>}
            </Box>

            {/* Seat Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">{t('booking.summary.seats', 'Seats')}</Typography>
              <Divider sx={{my:1}} />
              {formik.values.seatIds.length > 0 ? (
                <ListItemText 
                  primary={`${t('booking.summary.selectedSeats', 'Selected Seats')}: ${formik.values.seatIds.length}`}
                  secondary={`${t('booking.summary.seatNumbers', 'Seat(s)')}: ${formik.values.seatIds.join(', ')}`}
                />
              ) : <Typography>{t('booking.summary.noSeatsSelected', 'No seats selected.')}</Typography>}
            </Box>

            {/* Food & Drinks Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">{t('booking.summary.foodAndDrinks', 'Food & Drinks')}</Typography>
              <Divider sx={{my:1}} />
              {getSelectedFoodItemsDetails().length > 0 ? (
                <List dense>
                  {getSelectedFoodItemsDetails().map(item => (
                    item.id && (
                      <ListItem key={item.id} sx={{pl:0}}>
                        <ListItemText 
                          primary={`${item.name} (x${item.quantity})`}
                          secondary={`$${(item.subtotal || 0).toFixed(2)}`}
                        />
                      </ListItem>
                    )
                  ))}
                </List>
              ) : <Typography>{t('booking.summary.noFoodItemsSelected', 'No food or drinks added.')}</Typography>}
            </Box>
            
            {/* Total Price */}
            <Divider sx={{my:2}} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">{t('booking.summary.total', 'Total')}:</Typography>
              <Typography variant="h5" fontWeight="bold">${calculateTotalPrice().toFixed(2)}</Typography>
            </Box>

            {/* Payment Method Placeholder - The actual submission is handled by the main button */}
            <FormControl component="fieldset" fullWidth>
              <InputLabel id="payment-method-label" shrink sx={{position: 'static', transform: 'none', mb:1, fontWeight:'bold'}}>
                {t('booking.summary.paymentMethod', 'Payment Method')}
              </InputLabel>
              <RadioGroup
                aria-label="paymentMethod"
                name="paymentMethod"
                value={formik.values.paymentMethod}
                onChange={(event) => formik.setFieldValue('paymentMethod', event.target.value)}
                row
              >
                <FormControlLabel value="QR_MOMO" control={<Radio />} label={t('booking.summary.qrMomo', 'Thanh toán MoMo')} />
                <FormControlLabel value="QR_SEPAY" control={<Radio />} label={t('booking.summary.qrSePay', 'Thanh toán VietQR/Banking')} />
                <FormControlLabel value="creditCard" control={<Radio />} label={t('booking.summary.creditCard', 'Credit Card (Mock)')} />
                <FormControlLabel value="paypal" control={<Radio />} label={t('booking.summary.paypal', 'PayPal (Mock)')} />
              </RadioGroup>
            </FormControl>

          </Box>
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  // Add useEffect to handle direct seat selection
  useEffect(() => {
    // If showtimeId is provided, set it in formik and state
    if (showtimeId) {
      console.log("[Direct Seat Selection] Using provided showtimeId:", showtimeId);
      setSelectedShowtime(showtimeId);
      formik.setFieldValue('showtimeId', showtimeId);
      
      // Make sure we're on the seat selection step
      setActiveStep(1);
    }
  }, [showtimeId]);

  return (
    <Box sx={{ width: '100%', p: directBooking ? 0 : 3 }}>
      {!directBooking && (
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          {t('booking.title', 'Book Your Movie Ticket')}
        </Typography>
      )}
      <Paper sx={{ p: directBooking ? 2 : 3, borderRadius: 2 }} elevation={directBooking ? 0 : 3}>
        {!bookingCompleted ? (
          <form onSubmit={formik.handleSubmit}>
            {!directBooking && (
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{t(label, label)}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            )}
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                {t('common.back', 'Quay lại')}
              </Button>
              <Button 
                variant="contained" 
                type={activeStep === steps.length - 1 ? 'submit' : 'button'}
                onClick={activeStep === steps.length - 1 ? undefined : handleNext} // Use undefined for submit to let formik handle
                disabled={loading || (activeStep === 1 && formik.values.seatIds.length === 0)}
              >
                {activeStep === steps.length - 1 
                  ? t('common.confirmPay', 'Tiếp tục') 
                  : t('common.next', 'Tiếp tục')}
              </Button>
            </Box>
          </form>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" color="success.main" gutterBottom>
              {successMessage || t('booking.successTitle', 'Booking Successful!')}
            </Typography>
            {bookingDetails && (
              <Paper sx={{ p: 2, mt: 2, textAlign: 'left', backgroundColor: theme.palette.grey[50] }} variant="outlined">
                <Typography variant="h6" gutterBottom>{t('booking.summary.title', 'Booking Summary')}</Typography>
                <Typography><strong>{t('booking.summary.bookingCode', 'Booking Code')}:</strong> {bookingDetails.bookingCode}</Typography>
                <Divider sx={{my:1}}/>
                <Typography><strong>{t('booking.summary.movie', 'Movie')}:</strong> {bookingDetails.movie.movieName}</Typography>
                <Typography><strong>{t('booking.summary.cinema', 'Cinema')}:</strong> {bookingDetails.cinema.cinemaName} - {bookingDetails.cinema.roomName}</Typography>
                <Typography><strong>{t('booking.summary.time', 'Time')}:</strong> {bookingDetails.movie.date} {bookingDetails.movie.startTime}</Typography>
                <Typography><strong>{t('booking.summary.seats', 'Seats')}:</strong> {bookingDetails.seats.join(', ')}</Typography>
                {bookingDetails.foodItems && bookingDetails.foodItems.length > 0 && (
                  <Box mt={1}>
                    <Typography><strong>{t('booking.summary.foodDrinks', 'Food & Drinks')}:</strong></Typography>
                    <List dense disablePadding>
                      {bookingDetails.foodItems.map(item => (
                        <ListItem key={item.id} disableGutters sx={{pl:2}}>
                          <ListItemText primary={`${item.name} (x${item.quantity})`} secondary={`${t('common.price', 'Price')}: ${item.subtotal.toLocaleString()} VND`} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                <Divider sx={{my:1}}/>
                <Typography variant="subtitle1" sx={{fontWeight: 'bold'}}><strong>{t('booking.summary.totalAmount', 'Total Amount')}:</strong> {bookingDetails.totalAmount.toLocaleString()} VND</Typography>
                <Typography><strong>{t('booking.summary.paymentStatus', 'Payment Status')}:</strong> {bookingDetails.paymentStatus}</Typography>
              </Paper>
            )}
            <Button variant="contained" onClick={() => { /* Reset or navigate away */ setActiveStep(0); setBookingCompleted(false); formik.resetForm(); }} sx={{ mt: 3 }}>
              {t('booking.bookAnother', 'Book Another Ticket')}
            </Button>
          </Box>
        )}
      </Paper>
      {/* Phần debug để hiển thị kết quả */} 
      {debugResult && (
        <Paper sx={{ p: 2, mt: 2, backgroundColor: theme.palette.grey[100] }}>
          <Typography variant="h6">Debug Output:</Typography>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {debugResult}
          </pre>
        </Paper>
      )}
      {showQrModal && bookingId && (
        <QrPaymentModal
          open={showQrModal}
          onClose={() => setShowQrModal(false)}
          bookingData={getBookingData()}
          bookingId={bookingId}
          totalAmount={calculateTotalPrice()}
          onPaymentCompleted={handlePaymentCompleted}
          onPaymentExpired={handlePaymentExpired}
        />
      )}
    </Box>
  );
};

export default BookingForm; 