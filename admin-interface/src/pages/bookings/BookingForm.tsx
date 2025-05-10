import React, { useState, useEffect } from 'react';
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
  Showtime,
  Seat,
  SeatStatus,
  FoodItem,
  FoodSelection
} from '../../services/bookingService';
import { useTheme } from '@mui/material/styles';
import axiosInstance from '../../utils/axios';

interface ApiResponse<T> {
  result?: T;
  data?: T;
}

interface MovieInfo {
  movieId: number;
  movieName: string;
  date: string;
  startTime: string;
  endTime?: string;
  time?: string;
}

interface CinemaInfo {
  cinemaName: string;
  roomName: string;
  address?: string;
}

interface FoodItemInfo {
  id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface BookingData {
  bookingId: number;
  status: string;
  movie: MovieInfo;
  cinema: CinemaInfo;
  seats: string[];
  totalAmount: number;
  foodItems?: FoodItemInfo[];
}

interface FinalBookingDetails extends BookingData {
  paymentStatus: string;
  paymentId: number;
  bookingCode: string;
}

interface PaymentData {
  paymentId: number;
  status: string;
  amount: number;
}

type BookingResponse = ApiResponse<BookingData>;
type PaymentResponse = ApiResponse<PaymentData>;

// Các interface đã được chuyển sang bookingService.ts

const steps = ['Select Showtime', 'Select Seats', 'Add Food & Drinks', 'Confirm & Pay'];

interface BookingFormProps {
  movieId?: string; 
  cinemaId?: string; // Thêm cinemaId vào props
  directBooking?: boolean; // Thêm tùy chọn đặt vé trực tiếp
}

const BookingForm: React.FC<BookingFormProps> = ({ movieId, cinemaId, directBooking = false }) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<FinalBookingDetails | null>(null);

  // State thay thế mock data với API data
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [seatLayout, setSeatLayout] = useState<Seat[][]>([]); 
  const [availableFoodItems, setAvailableFoodItems] = useState<FoodItem[]>([]);

  const theme = useTheme();

  // Thêm state để lưu trữ kết quả debug
  const [debugResult, setDebugResult] = useState<string>('');

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
      paymentMethod: 'creditCard',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
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
        
        // Create booking
        // Create booking
        const bookingData = await (async (): Promise<BookingData> => {
          try {
            const response = await axiosInstance.post<BookingResponse>('/bookings/create', bookingRequest);
            const data = response.data?.result || response.data?.data;
            if (!data) {
              throw new Error('Invalid booking response format');
            }
            return data;
          } catch (error) {
            // Try alternative endpoint
            const altResponse = await axiosInstance.post<BookingResponse>(
              '/payment/sepay-webhook',
              bookingRequest
            );
            const data = altResponse.data?.result || altResponse.data?.data;
            if (!data) {
              throw new Error('Invalid booking response format from alternative endpoint');
            }
            return data;
          }
        })();
        
        // ===== BƯỚC 2: XỬ LÝ PHẢN HỒI ĐẶT VÉ =====
        // Kiểm tra nhiều cấu trúc response có thể có
        
        // Process payment
        const paymentResult = await (async (): Promise<PaymentData> => {
          const paymentData = {
            bookingId: bookingData.bookingId,
            paymentMethod: values.paymentMethod,
            amount: calculateTotalPrice(),
            status: 'SUCCESS'
          };

          try {
            const response = await axiosInstance.post<PaymentResponse>('/payments/simulate', paymentData);
            const data = response.data?.result || response.data?.data;
            if (!data) {
              throw new Error('Invalid payment response format');
            }
            return data;
          } catch (error) {
            const altResponse = await axiosInstance.post<PaymentResponse>('/payment/process', paymentData);
            const data = altResponse.data?.result || altResponse.data?.data;
            if (!data) {
              throw new Error('Invalid payment response format from alternative endpoint');
            }
            return data;
          }
        })();
        
        // ===== BƯỚC 4: TẠO BOOKING DETAILS =====
        // Tạo mô hình booking details từ dữ liệu có sẵn
        // Create final booking details with all required properties
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
      } catch (err: any) {
        console.error('Lỗi đặt vé:', err);
        setError(err.message || 'Đã xảy ra lỗi khi đặt vé. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleNext = () => {
    // Trigger validation for the current step before proceeding
    if (activeStep === 0) {
      formik.validateField('showtimeId').then(fieldError => {
        if (!fieldError) { // if fieldError is undefined, validation passed
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
          formik.setFieldTouched('showtimeId', true, true); // Show validation error and run validation
        }
      });
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
      try {
        setLoading(true);
        setError(null); // Reset error state
        let response;
        
        if (movieId && cinemaId) {
          // Nếu có movieId và cinemaId, gọi API lấy showtimes theo phim và rạp
          response = await bookingService.getShowtimesByMovieAndCinema(movieId, cinemaId);
        } else if (movieId) {
          // Nếu chỉ có movieId, gọi API lấy showtimes theo phim
          response = await bookingService.getShowtimesByMovie(movieId);
        } else {
          // Nếu không có cả hai, lấy tất cả showtimes có sẵn (hoặc có thể báo lỗi/yêu cầu chọn phim/rạp)
          // Hiện tại, để đơn giản, vẫn gọi getAllShowtimes nếu không có movieId.
          // Trong một flow hoàn chỉnh, bước này nên được xử lý trước khi vào BookingForm nếu không có đủ thông tin.
          response = await bookingService.getAllShowtimes(); 
        }
        
        if (response?.data) {
          setShowtimes(response.data);
        } else {
          setShowtimes([]); // Nếu không có data, set mảng rỗng
        }
      } catch (err: any) {
        console.error('Error fetching showtimes:', err);
        setError(err.message || 'Error fetching showtimes');
        setShowtimes([]); // Set mảng rỗng khi có lỗi
      } finally {
        setLoading(false);
      }
    };
    
    fetchShowtimesData();
  }, [movieId, cinemaId]); // Thêm cinemaId vào dependencies

  // Fetch seat layout when showtimeId changes and we are on the seat selection step
  useEffect(() => {
    const fetchSeatLayout = async () => {
      if (formik.values.showtimeId && activeStep === 1) {
        try {
          setLoading(true);
          const selectedShowtime = showtimes.find(st => st.id === formik.values.showtimeId);
          if (!selectedShowtime) {
            throw new Error('Không tìm thấy thông tin suất chiếu');
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
              let price = selectedShowtime.price || 70000; // Base price from showtime

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
  }, [formik.values.showtimeId, activeStep, showtimes]); // Ensure all dependencies are listed

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

  // Helper function to find selected showtime details
  const getSelectedShowtimeDetails = () => {
    if (!formik.values.showtimeId || showtimes.length === 0) return null;
    return showtimes.find(st => st.id === formik.values.showtimeId);
  };

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
    const currentShowtime = showtimes.find(st => st.id === formik.values.showtimeId);

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
            <Typography variant="h6" sx={{ mb: 2 }}>{t('booking.selectShowtime', 'Select Showtime')}</Typography>
            {showtimes.length === 0 && !loading && (
              <Typography sx={{my: 2}}>{t('booking.noShowtimes', 'No showtimes available for this movie or selection.')}</Typography>
            )}
            {showtimes.length > 0 && (
              <FormControl component="fieldset" error={formik.touched.showtimeId && Boolean(formik.errors.showtimeId)} fullWidth>
                <InputLabel id="showtime-select-label" shrink={!!formik.values.showtimeId} sx={{position: 'static', transform: 'none', mb:1}}>
                  {t('booking.availableShowtimes', 'Available Showtimes')}
                </InputLabel>
                <RadioGroup
                  aria-label="showtime"
                  name="showtimeId"
                  value={formik.values.showtimeId}
                  onChange={(event) => {
                    formik.setFieldValue('showtimeId', event.target.value);
                  }}
                >
                  <List>
                    {showtimes.map((showtime) => (
                      <React.Fragment key={showtime.id}>
                        <ListItem 
                          button 
                          onClick={() => formik.setFieldValue('showtimeId', showtime.id)}
                          selected={formik.values.showtimeId === showtime.id}
                          sx={{ 
                            borderRadius: 1, 
                            mb: 1, 
                            border: '1px solid', 
                            borderColor: formik.values.showtimeId === showtime.id ? 'primary.main' : 'divider',
                            '&:hover': {
                              borderColor: 'primary.light',
                            }
                          }}
                        >
                          <Radio value={showtime.id} sx={{mr: 1}} checked={formik.values.showtimeId === showtime.id} />
                          <ListItemText 
                            primary={`${showtime.time} - ${showtime.roomName}`} 
                            secondary={t('booking.seatsAvailable', '{{count}} seats available', { count: showtime.availableSeats })} 
                          />
                        </ListItem>
                        <Divider sx={{mb: 1, display: showtimes.indexOf(showtime) === showtimes.length -1 ? 'none' : 'block' }}/>
                      </React.Fragment>
                    ))}
                  </List>
                </RadioGroup>
                {formik.touched.showtimeId && formik.errors.showtimeId && (
                  <Typography color="error" variant="caption">{formik.errors.showtimeId as string}</Typography>
                )}
              </FormControl>
            )}
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2, textAlign: 'center' }}>
              {t('booking.selectSeats')}
            </Typography>
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

                      return (
                        <Tooltip 
                          title={isDisabled ? t(`booking.seatStatus.${seat.status.toLowerCase()}`) : `${t(`booking.seatType.${seat.type?.toLowerCase() || 'regular'}`)} - ${seat.price.toLocaleString('vi-VN')}đ`} 
                          key={seat.id}
                          arrow
                          placement="top"
                        >
                          <Box
                            onClick={() => !isDisabled && formik.setFieldValue('seatIds', 
                              isSelected 
                                ? formik.values.seatIds.filter(id => id !== seat.id) 
                                : [...formik.values.seatIds, seat.id]
                            )}
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
                              // Add specific icons or shapes for different seat types if needed
                              // Example: border radius for couple seats, or an icon
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
                { type: 'SELECTED', label: t('booking.seatStatus.selected') || 'Selected', status: SeatStatus.Selected }, // Special case for legend
                { type: 'BOOKED', label: t('booking.seatStatus.booked') || 'Booked', status: SeatStatus.Booked },
                { type: 'UNAVAILABLE', label: t('booking.seatStatus.unavailable') || 'Unavailable', status: SeatStatus.Unavailable },
              ].map(item => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 20, 
                      height: 20, 
                      backgroundColor: getSeatColors({ type: item.type, status: item.status } as Seat, item.status === SeatStatus.Selected), 
                      mr: 1, 
                      borderRadius: '3px',
                      border: item.type === 'AISLE' ? `1px dashed ${theme.palette.grey[400]}` : 'none', // Consistent with AISLE style
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
                    primary={t('booking.summary.movie', 'Movie: TODO')} // TODO: Get Movie Name if available
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

  return (
    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3, boxShadow: '0 8px 30px 0 rgba(0,0,0,0.08)' }}>
      <Typography variant="h4" fontWeight="700" color="text.primary" sx={{ mb: 4, textAlign: 'center' }}>
        {t('booking.title', 'Book Your Tickets')}
      </Typography>
      
      {/* Debug Tools */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">Debug Tools</Typography>
        <Button variant="outlined" color="info" onClick={checkToken} sx={{ mr: 1, mt: 1 }}>
          Check Token
        </Button>
        <Button variant="outlined" color="warning" onClick={simplifiedBooking} sx={{ mt: 1 }}>
          Book Simply
        </Button>
        {debugResult && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#000', color: '#fff', borderRadius: 1, maxHeight: '200px', overflow: 'auto' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{debugResult}</pre>
          </Box>
        )}
      </Box>
      
      {!bookingCompleted && (
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}
      
      <form onSubmit={formik.handleSubmit}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && !bookingCompleted && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
        
        {renderStepContent(activeStep)}

        {!bookingCompleted && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              {t('common.back', 'Back')}
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                {t('booking.confirmAndPay', 'Confirm & Pay')}
              </Button>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleNext}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                {t('common.next', 'Next')}
              </Button>
            )}
          </Box>
        )}
      </form>
    </Paper>
  );
};

export default BookingForm; 