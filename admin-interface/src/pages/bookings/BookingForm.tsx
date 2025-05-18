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
  FoodSelection,
  BookingRequest
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast as toastifyToast } from 'react-toastify';
import jwtDecode from 'jwt-decode';

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

// Endpoints for booking operations
const BOOKING_ENDPOINTS = {
  CREATE: '/api/v1/payment/sepay-webhook',
  CREATE_ALT: '/api/v1/payment/bookings/create',
  SIMULATE_PAYMENT: '/api/v1/payment/simulate',
  GET_DETAILS: '/api/v1/payment',
  TEST: '/api/v1/payment/test-booking'
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
  const [totalPriceForQr, setTotalPriceForQr] = useState<number>(0); // Added state for QR total price

  // Add new state variables to track selected data
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSeats, setSelectedSeats] = useState<Array<{code: string}>>([]);

  // Add a reference to store if we're in direct booking mode with showtimeId
  const isDirectSeatSelection = useRef(!!showtimeId);

  // Thêm state cho việc refresh seat layout
  const [refreshSeatTrigger, setRefreshSeatTrigger] = useState<number>(0);

  // Thêm hàm refresh seat layout
  const refreshSeatLayout = useCallback(() => {
    setRefreshSeatTrigger(prev => prev + 1);
  }, []);

  // Move formik initialization here before any useCallbacks that depend on it
  const formik = useFormik<{
    showtimeId: string;
    seatIds: string[];
    foodItems: FoodSelection[];
    paymentMethod: string;
  }>({
    initialValues: {
      showtimeId: showtimeId || '',
      seatIds: [],
      foodItems: [],
      paymentMethod: 'QR_MOMO',
    },
    validationSchema: Yup.object().shape({
      showtimeId: Yup.string().when((_, schema) => activeStep === 0 ? schema.required('Showtime is required') : schema),
      seatIds: Yup.array().when((_, schema) => activeStep === 1 ? schema.min(1, 'Please select at least one seat.').required('Please select at least one seat.') : schema),
      foodItems: Yup.array().when((_, schema) => activeStep === 2 ? schema.of(
        Yup.object().shape({
          itemId: Yup.string().required(),
          quantity: Yup.number().min(1).required()
        })
      ) : schema),
      paymentMethod: Yup.string().when((_, schema) => activeStep === 3 ? schema.required('Payment method is required') : schema),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setFriendlyError(null);
        console.log("📊 SUBMIT DEBUG: Form submission started with values:", values);
        setDebugResult("📊 SUBMIT DEBUG: Form submission started");
        
        const showtimeDetails = getSelectedShowtimeDetails();
        if (!showtimeDetails) {
          console.error("📊 SUBMIT DEBUG: No showtime selected!");
          throw new Error('No showtime selected. Please select a showtime and try again.');
        }
        
        console.log("📊 SUBMIT DEBUG: Selected showtime details:", showtimeDetails);
        setDebugResult(prev => prev + "\n- Selected showtime: " + 
          JSON.stringify({
            scheduleId: showtimeDetails.scheduleId,
            roomId: showtimeDetails.roomId,
            movie: currentMovieInfo.name,
            time: showtimeDetails.scheduleTime
          })
        );
        
        // Force verify seat availability one more time before completing booking
        const selectedShowtime = getSelectedShowtimeDetails();
        if (!selectedShowtime) {
          setError('Không tìm thấy thông tin suất chiếu đã chọn. Vui lòng chọn lại.');
          toast.error('Không tìm thấy thông tin suất chiếu đã chọn. Vui lòng chọn lại.');
          setLoading(false);
          return;
        }
        
        console.log("Verifying seat availability one last time before booking...");
        try {
          // Request fresh seat data with explicit cache busting
          const timestamp = Date.now();
          const response = await bookingService.getSeatLayout(
            selectedShowtime.scheduleId, 
            selectedShowtime.roomId
          );
          
          if (response && response.data) {
            // Check if any seats we're trying to book are already booked
            const bookedSeatIds: string[] = []; // Add explicit type
            for (const seatId of values.seatIds) {
              const seat = response.data?.find((s: Seat) => s.id === seatId);
              if (seat && seat.status === SeatStatus.Booked) {
                bookedSeatIds.push(seatId);
                console.log(`Seat ${seatId} status=${seat.status} - already booked!`);
              } else if (seat) {
                console.log(`Seat ${seatId} status=${seat.status} - available for booking`);
              } else {
                console.log(`Warning: Seat ${seatId} not found in latest data`);
              }
            }
            
            if (bookedSeatIds.length > 0) {
              const message = `${bookedSeatIds.length} ghế bạn đã chọn vừa được người khác đặt. Vui lòng chọn ghế khác.`;
              setError(message);
              toast.error(message);
              
              // Update formik values to remove booked seats
              const updatedSeatIds = values.seatIds.filter(id => !bookedSeatIds.includes(id));
              formik.setFieldValue('seatIds', updatedSeatIds);
              
              // Refresh seat layout
              setActiveStep(1); // Go back to seat selection
              refreshSeatLayout();
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          // If verification fails, proceed with booking but log the error
          console.error("Error verifying seat availability:", error);
          // Don't block booking process on verification error
        }
        
        // Create the booking request object
        const bookingRequest: BookingRequest = {
          scheduleId: showtimeDetails.scheduleId,
          roomId: showtimeDetails.roomId,
          seatIds: values.seatIds,
          foodItems: values.foodItems.map(item => ({
            foodId: parseInt(item.itemId), 
            quantity: item.quantity
          })),
          paymentMethod: values.paymentMethod
        };
        
        console.log("📊 SUBMIT DEBUG: Creating booking with request:", bookingRequest);
        setDebugResult(prev => prev + "\n- Booking request: " + JSON.stringify(bookingRequest));
        
        // Use the bookingService to create the booking
        try {
          console.log("📊 SUBMIT DEBUG: Calling bookingService.createBooking with endpoint:", BOOKING_ENDPOINTS?.CREATE || "Unknown endpoint");
          setDebugResult(prev => prev + "\n- Calling API endpoint: " + (BOOKING_ENDPOINTS?.CREATE || "Unknown endpoint"));
          
          const bookingResponse = await bookingService.createBooking(bookingRequest);
          
          console.log("📊 SUBMIT DEBUG: Booking API response:", bookingResponse);
          setDebugResult(prev => prev + "\n- Booking API response received: " + JSON.stringify(bookingResponse).substring(0, 200) + "...");
          
          // Extract booking details from the response
          const bookingCreationResult = bookingResponse?.result || bookingResponse;

          if (!bookingCreationResult || !bookingCreationResult.bookingId) {
            console.error("📊 SUBMIT DEBUG: Failed to create booking - missing bookingId", bookingResponse);
            setDebugResult(prev => prev + "\n- ERROR: Failed to create booking - missing bookingId");
            throw new Error('Failed to create booking or bookingId is missing from response.');
          }
          
          const actualBookingId = bookingCreationResult.bookingId;
          const actualTotalAmount = bookingCreationResult.totalAmount || calculateTotalPrice(); 

          console.log(`📊 SUBMIT DEBUG: Booking created successfully. Booking ID: ${actualBookingId}, Total Amount: ${actualTotalAmount}`);
          setDebugResult(prev => prev + `\n- SUCCESS: Booking created with ID: ${actualBookingId}`);
          
          setBookingId(actualBookingId);
          setTotalPriceForQr(actualTotalAmount);

          if (values.paymentMethod.startsWith('QR_')) {
            console.log("📊 SUBMIT DEBUG: QR_PAYMENT selected, showing QR modal");
            setDebugResult(prev => prev + "\n- QR payment selected, showing modal");
            setShowQrModal(true);
          } else {
            // For non-QR payment methods
            console.log("📊 SUBMIT DEBUG: Non-QR payment method selected:", values.paymentMethod);
            setDebugResult(prev => prev + "\n- Non-QR payment selected: " + values.paymentMethod);
            
            try {
              // Gọi API simulation payment thay vì tạo mock data
              console.log("📊 SUBMIT DEBUG: Simulating payment for booking ID:", actualBookingId);
              setDebugResult(prev => prev + "\n- Simulating payment for booking ID: " + actualBookingId);
              
              const paymentData = {
                bookingId: actualBookingId,
                paymentMethod: values.paymentMethod,
                amount: actualTotalAmount,
                status: 'SUCCESS'
              };
              
              console.log("📊 SUBMIT DEBUG: Sending payment data to API:", paymentData);
              setDebugResult(prev => prev + "\n- Payment data: " + JSON.stringify(paymentData));
              console.log("📊 SUBMIT DEBUG: Calling payment endpoint:", BOOKING_ENDPOINTS?.SIMULATE_PAYMENT || "Unknown endpoint");
              setDebugResult(prev => prev + "\n- Calling payment API: " + (BOOKING_ENDPOINTS?.SIMULATE_PAYMENT || "Unknown endpoint"));
              
              // Gọi API simulation
              const paymentResponse = await bookingService.simulatePayment(paymentData);
              console.log("📊 SUBMIT DEBUG: Payment simulation response:", paymentResponse);
              setDebugResult(prev => prev + "\n- Payment response: " + JSON.stringify(paymentResponse).substring(0, 200));
              
              // Xác nhận thanh toán thành công
              const paymentResult = paymentResponse?.result || paymentResponse;
              if (!paymentResult) {
                console.error("📊 SUBMIT DEBUG: Payment simulation failed - empty response");
                setDebugResult(prev => prev + "\n- ERROR: Payment simulation failed - empty response");
                throw new Error('Payment simulation failed or returned empty response');
              }
              
              console.log("📊 SUBMIT DEBUG: Payment successful, creating booking details");
              setDebugResult(prev => prev + "\n- Payment successful, finalizing booking");
              
              // Tạo booking details từ kết quả API thực tế
              const finalBookingDetails: FinalBookingDetails = {
                bookingId: actualBookingId,
                status: bookingCreationResult.status || "CONFIRMED",
                bookingCode: bookingCreationResult.bookingCode || `B${actualBookingId}`,
                movie: bookingCreationResult.movie || { 
                  movieId: showtimeDetails.movieId || currentMovieInfo.id || 0,
                  movieName: showtimeDetails.movieName || currentMovieInfo.name || "Selected Movie",
                  date: showtimeDetails.date || new Date().toISOString().split('T')[0],
                  startTime: showtimeDetails.scheduleTime || "Unknown",
                  endTime: "Unknown",
                  time: showtimeDetails.scheduleTime || "Unknown"
                },
                cinema: bookingCreationResult.cinema || { 
                  cinemaName: showtimeDetails.branchName || "Cinema",
                  roomName: showtimeDetails.roomName || "Unknown Room",
                  address: showtimeDetails.branchAddress || "Unknown Address"
                },
                seats: bookingCreationResult.seats || values.seatIds,
                totalAmount: actualTotalAmount,
                paymentStatus: "PAID", 
                paymentId: paymentResult.transactionId || Date.now(), 
                foodItems: bookingCreationResult.foodItems || getSelectedFoodItemsDetails()
              };
              
              console.log("📊 SUBMIT DEBUG: Final booking details:", finalBookingDetails);
              setDebugResult(prev => prev + "\n- SUCCESS: Booking finalized with details");
              
              // Update the UI to show booking completion
              setBookingDetails(finalBookingDetails);
              setBookingCompleted(true);
              setSuccessMessage('Đặt vé thành công!');
              
              // Clear any cached seat data
              console.log(`📊 SUBMIT DEBUG: Booking successful! Clearing all cached seat data.`);
              setDebugResult(prev => prev + "\n- Clearing cached seat data");
              sessionStorage.removeItem(`seatLayout-${showtimeDetails.scheduleId}-${showtimeDetails.roomId}`);
            } catch (error) {
              console.error("📊 SUBMIT DEBUG: Payment simulation error:", error);
              setDebugResult(prev => prev + "\n- ERROR in payment: " + (error instanceof Error ? error.message : 'Unknown error'));
              setError(`Lỗi xử lý thanh toán: ${error instanceof Error ? error.message : 'Không xác định'}`);
              toast.error('Không thể hoàn tất thanh toán. Vui lòng thử lại sau.');
            } finally {
              setLoading(false);
            }
          }
        } catch (err: any) {
          console.error("📊 SUBMIT DEBUG: Form submission error:", err);
          setDebugResult(prev => prev + "\n- CRITICAL ERROR: " + (err instanceof Error ? err.message : JSON.stringify(err)));
          handleAPIError(err, 'xử lý đặt vé');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Lỗi xử lý đặt vé:', err);
        handleAPIError(err, 'xử lý đặt vé');
        setLoading(false);
      }
    },
  });

  // Now keep all the useCallbacks that depend on formik
  const calculateTotalPrice = useCallback(() => {
    let total = 0;
    // Calculate seat price
    formik.values.seatIds.forEach(seatId => {
      for (const row of seatLayout) {
        const seat = row.find(s => s.id === seatId);
        if (seat) {
          total += seat.price;
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
  }, [formik.values.seatIds, formik.values.foodItems, seatLayout, availableFoodItems]);

  // Update getSelectedShowtimeDetails as useCallback with correct return type and properties
  const getSelectedShowtimeDetails = useCallback(() => {
    if (!formik.values.showtimeId) return null;
    for (const branch of showtimeBranches) {
      const foundShowtime = branch.showtimes.find(
        st => `${st.scheduleId}-${st.roomId}` === formik.values.showtimeId || st.scheduleId === parseInt(formik.values.showtimeId, 10)
      );
      if (foundShowtime) {
        return { 
          ...foundShowtime, 
          branchName: branch.branchName, 
          branchAddress: branch.address, 
          movieName: currentMovieInfo.name, // Add movieName from currentMovieInfo
          movieId: currentMovieInfo.id, // Add movieId from currentMovieInfo
          date: foundShowtime.scheduleDate, // Ensure date is correctly mapped if needed by this name
          time: foundShowtime.scheduleTime, // Map scheduleTime to time property
          startTime: foundShowtime.scheduleTime, // Map scheduleTime to startTime property
          endTime: foundShowtime.scheduleTime // Map scheduleTime to endTime property
        };
      }
    }
    return null;
  }, [formik.values.showtimeId, showtimeBranches, currentMovieInfo]);

  const getSelectedFoodItemsDetails = useCallback((): FoodItemInfo[] => {
    if (formik.values.foodItems.length === 0 || availableFoodItems.length === 0) return [];
    return formik.values.foodItems
      .map(selection => {
        const itemDetails = availableFoodItems.find(food => food.id === selection.itemId);
        if (itemDetails) {
          return {
            id: itemDetails.id,
            name: itemDetails.name,
            price: itemDetails.price,
            quantity: selection.quantity,
            subtotal: itemDetails.price * selection.quantity,
            imageUrl: itemDetails.imageUrl
          };
        }
        return null;
      })
      .filter(item => item !== null) as FoodItemInfo[];
  }, [formik.values.foodItems, availableFoodItems]);

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
        // Reset seat selections when moving to seat selection step
        formik.setFieldValue('seatIds', []);
        setSelectedSeats([]);
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

  // Replace mock seat layout with real API calls
  // Fetch seat layout when showtimeId changes and we are on the seat selection step
  useEffect(() => {
    const fetchSeatLayout = async () => {
      if (formik.values.showtimeId && activeStep === 1) {
        try {
          setLoading(true);
          setError(null);
          
          // Parse the showtime ID to get scheduleId and roomId
          let scheduleId: number;
          let roomId: number;
          
          // Check if the showtimeId is in the format "scheduleId-roomId"
          if (formik.values.showtimeId.includes('-')) {
            const parts = formik.values.showtimeId.split('-');
            scheduleId = parseInt(parts[0], 10);
            roomId = parseInt(parts[1], 10);
          } else {
            // If not in the expected format, try to find it in showtimeBranches
            let selectedShowtimeDetail: ShowtimeDetail | null = null;

            for (const branch of showtimeBranches) {
              const foundShowtime = branch.showtimes.find(
                st => st.scheduleId === parseInt(formik.values.showtimeId, 10)
              );
              if (foundShowtime) {
                selectedShowtimeDetail = foundShowtime;
                break;
              }
            }
            
            if (!selectedShowtimeDetail) {
              throw new Error('Không tìm thấy thông tin suất chiếu đã chọn trong dữ liệu đã tải.');
            }
            
            scheduleId = selectedShowtimeDetail.scheduleId;
            roomId = selectedShowtimeDetail.roomId;
          }
          
          console.log(`Fetching NEW seat layout for scheduleId: ${scheduleId}, roomId: ${roomId}, timestamp: ${new Date().toISOString()}`);
          
          // Call the API to get the real seat layout
          const response = await bookingService.getSeatLayout(scheduleId, roomId);
          
          if (!response || !response.data) {
            throw new Error('Không thể lấy dữ liệu sơ đồ ghế từ máy chủ.');
          }
          
          const seats = response.data;
          console.log(`Retrieved ${seats.length} seats from API. Booked seats: ${seats.filter(s => s.status === SeatStatus.Booked).length}`);
          
          // Organize seats into rows
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
          
          // Kiểm tra và xóa các ghế đã đặt khỏi selection
          const selectedSeatIds = formik.values.seatIds;
          const bookedSelectedSeats = selectedSeatIds.filter(seatId => {
            for (const row of layout) {
              const seat = row.find(s => s.id === seatId);
              if (seat && seat.status === SeatStatus.Booked) {
                return true;
              }
            }
            return false;
          });
          
          if (bookedSelectedSeats.length > 0) {
            console.log(`Found ${bookedSelectedSeats.length} previously selected seats that are now booked`);
            const updatedSelectedSeats = selectedSeatIds.filter(id => !bookedSelectedSeats.includes(id));
            formik.setFieldValue('seatIds', updatedSelectedSeats);
            setSelectedSeats(prev => prev.filter(seat => 
              !bookedSelectedSeats.some(id => {
                // Find the seat with this id and get its row/number
                for (const rowSeats of layout) {
                  const bookedSeat = rowSeats.find(s => s.id === id);
                  if (bookedSeat) {
                    return seat.code === `${bookedSeat.row}${bookedSeat.number}`;
                  }
                }
                return false;
              })
            ));
            toast.error(`Có ${bookedSelectedSeats.length} ghế bạn đã chọn vừa được người khác đặt. Vui lòng chọn ghế khác.`);
          }
          
          setSeatLayout(layout);
        } catch (err: any) {
          console.error('Error fetching seat layout:', err);
          setError(err.message || 'Error fetching seat layout');
          
          // In case of API failure, use a minimal fallback to prevent complete UI breakdown
          if (err.response?.status === 404 || err.response?.status >= 500) {
            toast.error(`Không thể lấy dữ liệu ghế: ${err.message}`);
            setFriendlyError('Hệ thống không thể lấy được sơ đồ ghế hiện tại. Vui lòng thử lại sau.');
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSeatLayout();
  }, [formik.values.showtimeId, activeStep, showtimeBranches, refreshSeatTrigger]);

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

  const handleAPIError = (error: any, context: string) => {
    console.error(`Lỗi ${context}:`, error);
    const message = error.response?.data?.message || error.message || `Đã xảy ra lỗi khi ${context}. Vui lòng thử lại.`;
    if (error.response?.status === 500) {
      setFriendlyError(`Hệ thống đang gặp sự cố khi ${context}. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.`);
    } else {
      setError(message);
    }
    toast.error(message);
  };

  const handlePaymentCompleted = useCallback(() => {
    setShowQrModal(false);
    setLoading(true); 

    const selectedShowtimeDetails = getSelectedShowtimeDetails();
    const currentFoodItems = getSelectedFoodItemsDetails();
    const finalBookingDetails: FinalBookingDetails = {
      bookingId: bookingId!,
      status: "CONFIRMED", 
      bookingCode: `B${bookingId!}`,
      movie: {
        movieId: selectedShowtimeDetails?.movieId || currentMovieInfo.id || 0,
        movieName: selectedShowtimeDetails?.movieName || currentMovieInfo.name || "Movie",
        date: selectedShowtimeDetails?.date || new Date().toISOString().split('T')[0],
        startTime: selectedShowtimeDetails?.scheduleTime || "N/A",
        endTime: "N/A", 
        time: selectedShowtimeDetails?.scheduleTime || "N/A"
      },
      cinema: {
        cinemaName: selectedShowtimeDetails?.branchName || "Cinema",
        roomName: selectedShowtimeDetails?.roomName || "Room",
        address: selectedShowtimeDetails?.branchAddress || "Address" 
      },
      seats: formik.values.seatIds,
      totalAmount: totalPriceForQr, 
      paymentStatus: "PAID",
      paymentId: Date.now(), 
      foodItems: currentFoodItems
    };
    
    setBookingDetails(finalBookingDetails);
    setBookingCompleted(true);
    setSuccessMessage('Đặt vé và thanh toán thành công!');
    toast.success('Thanh toán thành công!');
    
    // Force clear any cached seat data
    if (selectedShowtimeDetails) {
      console.log(`Clearing cached seat data for scheduleId: ${selectedShowtimeDetails.scheduleId}, roomId: ${selectedShowtimeDetails.roomId}`);
    }
    
    // Completely reset form and selections
    formik.resetForm();
    setSelectedSeats([]);
    setSeatLayout([]);
    
    setLoading(false);
  }, [bookingId, totalPriceForQr, currentMovieInfo, getSelectedShowtimeDetails, formik.values.seatIds, getSelectedFoodItemsDetails, setLoading, setShowQrModal, setBookingDetails, setBookingCompleted, setSuccessMessage]);

  const handlePaymentExpired = useCallback(() => {
    setShowQrModal(false);
    toast.error('Quá thời hạn thanh toán. Vui lòng thử lại.');
    if (movieId) { 
        navigate(`/movie/${movieId}`);
    }
    setActiveStep(0);
    formik.resetForm();
  }, [movieId, navigate, setActiveStep, formik, setShowQrModal]);

  const handleSeatSelection = (seat: Seat, isSelected: boolean) => {
    // Kiểm tra xem ghế có đang được người khác chọn không
    const isTemporaryReserved = temporaryReservedSeats.some(
      s => s.seatId === seat.id && s.userId !== userId.current
    );
    
    // Kiểm tra xem ghế có bị đặt rồi không
    if (seat.status === SeatStatus.Booked) {
      toast.error(`Ghế ${seat.row}${seat.number} đã được đặt`);
      return;
    }
    
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
        startTime: showtimeDetails?.scheduleTime || '',
        endTime: showtimeDetails?.scheduleTime || ''
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
        // Tạo một token ngẫu nhiên để định danh client nếu không có token
        const sessionToken = localStorage.getItem('token') || userId.current;
        
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
      // Lấy roomId và scheduleId từ formik.values.showtimeId (e.g., "123-45")
      const showtimeIdParts = formik.values.showtimeId.split('-');
      const scheduleId = showtimeIdParts[0];
      const roomId = showtimeIdParts[1];

      if (!roomId || !scheduleId) {
        console.error('RoomId or ScheduleId is missing from showtimeId:', formik.values.showtimeId);
        toast.error('Lỗi: Không thể xác định phòng hoặc lịch chiếu.');
        return;
      }
      
      const messageBody: Omit<SeatUpdateMessage, 'roomId' | 'scheduleId'> & {roomId?: string, scheduleId?: string} = {
        seatId: seatId,
        status: isSelected ? SeatStatus.Available : SeatStatus.Selected, 
        userId: userId.current,
        // roomId and scheduleId are in the path, but can be in body too if SeatUpdateMessage includes them
        // For strictness with backend SeatReservationRequest which might not have them, we can omit or make them optional
        timestamp: Date.now()
      };
      
      // If SeatUpdateMessage type *requires* roomId and scheduleId, add them:
      // messageBody.roomId = roomId;
      // messageBody.scheduleId = scheduleId;

      const destinationPath = `/app/seats/reserve/${roomId}/${scheduleId}`;
      
      stompClient.current.publish({
        destination: destinationPath,
        body: JSON.stringify(messageBody),
        headers: {
          'X-User-Id': userId.current
        }
      });
      
      console.log('Sent seat update to:', destinationPath, messageBody);
    } catch (error) {
      console.error('Error sending seat update:', error);
      toast.error('Lỗi khi gửi cập nhật trạng thái ghế.');
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
                    // Reset seat selections when moving to seat selection step
                    formik.setFieldValue('seatIds', []);
                    setSelectedSeats([]);
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

            {/* Thêm nút refresh */}
            {renderRefreshButton()}

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
      altXhr.open('POST', '/api/v1/payment/sepay-webhook', true);
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
    xhr.open('POST', '/api/v1/payment/simulate', true);
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
        altXhr.open('POST', '/api/v1/payment/process', true);
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
        startTime: selectedShowtime?.scheduleTime || 'Unknown',
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

  // Update the food items fetch function to use the real API
  useEffect(() => {
    const fetchFoodItems = async () => {
      if (activeStep === 2) {
        try {
          setLoading(true);
          setError(null);
          
          // Call the API to get real food items
          const response = await bookingService.getFoodItems();
          
          if (response?.data) {
            setAvailableFoodItems(response.data);
            console.log("Fetched food items:", response.data);
          } else {
            setAvailableFoodItems([]);
            setFriendlyError('Không thể tải danh sách đồ ăn và thức uống. Vui lòng thử lại sau.');
          }
        } catch (err: any) {
          console.error('Error fetching food items:', err);
          setError(err.message || 'Error fetching food and drinks');
          
          // Provide a better user experience with friendly error messages
          if (err.response?.status >= 500) {
            setFriendlyError('Hệ thống không thể lấy thông tin đồ ăn và thức uống. Bạn vẫn có thể tiếp tục đặt vé mà không cần chọn đồ ăn.');
          }
          
          // Set empty array to allow continuing without food items
          setAvailableFoodItems([]);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchFoodItems();
  }, [activeStep]);

  // Thêm nút refresh vào giao diện chọn ghế
  const renderRefreshButton = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={refreshSeatLayout}
          startIcon={<i className="fas fa-sync-alt" />}
          disabled={loading}
        >
          {loading ? 'Đang cập nhật...' : 'Cập nhật sơ đồ ghế'}
        </Button>
      </Box>
    );
  };

  // Thêm cleanup effect để reset sơ đồ ghế khi unmounting component
  useEffect(() => {
    return () => {
      setSeatLayout([]);
      formik.setFieldValue('seatIds', []);
      setSelectedSeats([]);
    };
  }, []);

  // Cập nhật effect để refresh sơ đồ ghế khi chuyển bước
  useEffect(() => {
    if (activeStep === 1) {
      refreshSeatLayout();
    }
  }, [activeStep, refreshSeatLayout]);

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
            {error && <Alert severity="error" sx={{my:2}}>{error}</Alert>}
            {friendlyError && <Alert severity="warning" sx={{my:2}}>{friendlyError}</Alert>}

            {renderStepContent(activeStep)}

            {!bookingCompleted && activeStep < steps.length -1 && !directBooking &&(
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                  {t('common.back')}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                >
                  {t('common.next')}
                </Button>
              </Box>
            )}
            {!bookingCompleted && activeStep === steps.length - 1 && !directBooking && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button disabled={loading} onClick={handleBack} sx={{ mr: 1 }}>
                  {t('common.back')}
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading || !formik.isValid}>
                  {t('booking.confirmAndPay', 'Confirm & Pay')}
                </Button>
              </Box>
            )}
             {/* Direct booking actions (simplified flow) */}
            {!bookingCompleted && directBooking && activeStep === steps.length -1 && (
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button disabled={loading} onClick={handleBack} sx={{ mr: 1 }}>
                        {t('common.back')}
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading || !formik.isValid}>
                        {t('booking.confirmAndPay', 'Confirm & Pay')}
                    </Button>
                </Box>
            )}
            
            {showQrModal && bookingId && (
              <QrPaymentModal
                open={showQrModal}
                onClose={() => {
                  setShowQrModal(false);
                  toast.success("Đã đóng cửa sổ thanh toán QR.")
                }}
                bookingData={{
                  bookingId: bookingId,
                  status: "PENDING_PAYMENT",
                  movie: {
                      movieId: getSelectedShowtimeDetails()?.movieId || currentMovieInfo.id || 0,
                      movieName: getSelectedShowtimeDetails()?.movieName || currentMovieInfo.name || "Movie",
                      date: getSelectedShowtimeDetails()?.date || new Date().toISOString().split('T')[0],
                      startTime: getSelectedShowtimeDetails()?.scheduleTime || "N/A",
                      endTime: "N/A",
                      time: getSelectedShowtimeDetails()?.scheduleTime || "N/A"
                  },
                  cinema: {
                      cinemaName: getSelectedShowtimeDetails()?.branchName || "Cinema",
                      roomName: getSelectedShowtimeDetails()?.roomName || "Room",
                      address: getSelectedShowtimeDetails()?.branchAddress || "Address"
                  },
                  seats: formik.values.seatIds,
                  foodItems: getSelectedFoodItemsDetails(),
                  totalAmount: totalPriceForQr,
                }}
                bookingId={bookingId} 
                totalAmount={totalPriceForQr} 
                onPaymentCompleted={handlePaymentCompleted}
                onPaymentExpired={handlePaymentExpired}
              />
            )}

            {bookingCompleted && bookingDetails && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: theme.palette.success.main, mb: 2 }} />
                <Typography variant="h5" gutterBottom>{successMessage || t('booking.successTitle', 'Booking Successful!')}</Typography>
                <Typography variant="body1" sx={{mb:1}}>{t('booking.successMessage.bookingCode', 'Your booking code is:')} <strong>{bookingDetails.bookingCode}</strong></Typography>
                <Typography variant="body1" sx={{mb:1}}>{t('booking.successMessage.movie', 'Movie:')} {bookingDetails.movie.movieName}</Typography>
                <Typography variant="body1" sx={{mb:1}}>{t('booking.successMessage.time', 'Time:')} {bookingDetails.movie.startTime} - {bookingDetails.movie.date}</Typography>
                <Typography variant="body1" sx={{mb:1}}>{t('booking.successMessage.cinema', 'Cinema:')} {bookingDetails.cinema.cinemaName} - {bookingDetails.cinema.roomName}</Typography>
                <Typography variant="body1" sx={{mb:1}}>{t('booking.successMessage.seats', 'Seats:')} {bookingDetails.seats.join(', ')}</Typography>
                {bookingDetails.foodItems && bookingDetails.foodItems.length > 0 && (
                  <Typography variant="body1" sx={{mb:1}}>
                    {t('booking.successMessage.foodItems', 'Food & Drinks:')} {bookingDetails.foodItems.map(item => `${item.name} x${item.quantity}`).join(', ')}
                  </Typography>
                )}
                <Typography variant="h6" sx={{mt:2, mb:3}}>{t('booking.successMessage.totalAmount', 'Total Amount:')} {bookingDetails.totalAmount.toLocaleString('vi-VN')}đ</Typography>
                <Button variant="contained" onClick={() => navigate('/movies')} sx={{mr:2}}>{t('booking.backToMovies')}</Button>
                <Button variant="outlined" onClick={() => navigate('/booking-history')}>{t('booking.viewBookingHistory')}</Button>
              </Box>
            )}
          </form>
        ) : (
           bookingDetails && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: theme.palette.success.main, mb: 2 }} />
                <Typography variant="h5" gutterBottom>{successMessage || t('booking.successTitle', 'Booking Successful!')}</Typography>
                <Typography variant="body1" sx={{mb:1}}>{t('booking.successMessage.bookingCode', 'Your booking code is:')} <strong>{bookingDetails.bookingCode}</strong></Typography>
                <Typography variant="body1" sx={{mb:1}}>{t('booking.successMessage.movie', 'Movie:')} {bookingDetails.movie.movieName}</Typography>
                <Typography variant="body1" sx={{mb:1}}>{t('booking.successMessage.time', 'Time:')} {bookingDetails.movie.startTime} - {bookingDetails.movie.date}</Typography>
                <Typography variant="body1" sx={{mb:1}}>{t('booking.successMessage.cinema', 'Cinema:')} {bookingDetails.cinema.cinemaName} - {bookingDetails.cinema.roomName}</Typography>
                <Typography variant="body1" sx={{mb:1}}>{t('booking.successMessage.seats', 'Seats:')} {bookingDetails.seats.join(', ')}</Typography>
                 {bookingDetails.foodItems && bookingDetails.foodItems.length > 0 && (
                  <Typography variant="body1" sx={{mb:1}}>
                    {t('booking.successMessage.foodItems', 'Food & Drinks:')} {bookingDetails.foodItems.map(item => `${item.name} x${item.quantity}`).join(', ')}
                  </Typography>
                )}
                <Typography variant="h6" sx={{mt:2, mb:3}}>{t('booking.successMessage.totalAmount', 'Total Amount:')} {bookingDetails.totalAmount.toLocaleString('vi-VN')}đ</Typography>
                <Button variant="contained" onClick={() => navigate('/movies')} sx={{mr:2}}>{t('booking.backToMovies')}</Button>
                <Button variant="outlined" onClick={() => navigate('/booking-history')}>{t('booking.viewBookingHistory')}</Button>
            </Box>
           )
        )}
      </Paper>
    </Box>
  );
};

export default BookingForm; 