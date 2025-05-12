import axiosInstance from '../utils/axios';

// Sử dụng đường dẫn tương đối thay vì URL tuyệt đối để proxy hoạt động
const API_URL = ''; // Tương đối với baseURL của axios

// Định nghĩa các interface dựa trên API backend
export interface Showtime {
  id: string;
  time: string;
  roomName: string;
  availableSeats: number;
  price: number;
  movieId: number;
  movieName: string;
  roomId: number;
  scheduleId: number;
}

export enum SeatStatus {
  Available = 'AVAILABLE',
  Booked = 'BOOKED',
  Selected = 'SELECTED',
  Unavailable = 'UNAVAILABLE',
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
  price: number;
  type?: 'REGULAR' | 'VIP' | 'COUPLE' | 'SWEETBOX' | string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface FoodSelection {
  itemId: string;
  quantity: number;
}

export interface BookingRequest {
  scheduleId: number;
  roomId: number;
  seatIds: string[];
  foodItems: {
    foodId: number;
    quantity: number;
  }[];
  paymentMethod: string;
}

export interface BookingResponse {
  bookingId: number;
  bookingCode: string;
  movie: {
    movieId: number;
    movieName: string;
    format: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  cinema: {
    cinemaName: string;
    roomName: string;
    address: string;
  };
  seats: string[];
  totalAmount: number;
  foodItems: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

// Correct endpoints based on backend controller paths
const BOOKING_ENDPOINTS = {
  CREATE: '/payment/sepay-webhook',
  CREATE_ALT: '/payment/bookings/create',
  SIMULATE_PAYMENT: '/payment/simulate',
  GET_DETAILS: '/payment',
  TEST: '/payment/test-booking'
};

export const bookingService = {
  // Lấy danh sách suất chiếu theo phim
  getShowtimesByMovie: async (movieId: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await axiosInstance.get(`${API_URL}/api/v1/showtime/${movieId}/by-date`, {
        params: { date: today }
      });
      
      console.log(`[bookingService.getShowtimesByMovie] Raw response for movie ${movieId}, date ${today}:`, response.data);

      // Handle possible response structures
      if (response.data?.result) {
        console.log(`[bookingService.getShowtimesByMovie] Using response.data.result:`, response.data.result);
        return response.data.result;
      } else if (Array.isArray(response.data)) {
        console.warn(`[bookingService.getShowtimesByMovie] Response data is an array, wrapping:`, response.data);
        return { data: response.data };
      } else if (response.data?.data) {
        console.warn(`[bookingService.getShowtimesByMovie] Using response.data.data:`, response.data.data);
        return response.data;
      }
      
      console.warn(`[bookingService.getShowtimesByMovie] Unexpected response structure, returning empty. Response:`, response.data);
      return { data: [] };
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      return { data: [] };
    }
  },

  // Lấy danh sách suất chiếu theo phim VÀ RẠP
  getShowtimesByMovieAndCinema: async (movieId: string, cinemaId: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await axiosInstance.get(`${API_URL}/api/v1/showtime/${movieId}/filter`, {
        params: {
          date: today,
          cinemaId: cinemaId
        }
      });
      
      // Handle possible response structures
      if (response.data?.result) {
        return response.data.result;
      } else if (Array.isArray(response.data)) {
        return { data: response.data };
      } else if (response.data?.data) {
        return response.data;
      }
      
      return { data: [] };
    } catch (error) {
      console.error('Error fetching filtered showtimes:', error);
      return { data: [] };
    }
  },

  // Lấy danh sách tất cả suất chiếu có sẵn
  getAllShowtimes: async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await axiosInstance.get(`${API_URL}/api/v1/showtime/1/by-date`, {
        params: { date: today }
      });
      
      if (response.data?.result) {
        return response.data.result;
      } else if (Array.isArray(response.data)) {
        return { data: response.data };
      } else if (response.data?.data) {
        return response.data;
      }
      return { data: [] };
    } catch (error) {
      console.error('Error fetching all showtimes:', error);
      return { data: [] };
    }
  },

  // Lấy sơ đồ ghế cho một suất chiếu
  getSeatLayout: async (scheduleId: number, roomId: number) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/api/v1/showtime/${scheduleId}/${roomId}/detail`);
      if (response.data?.result) {
        return response.data.result;
      } else if (response.data?.data) {
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching seat layout:', error);
      throw new Error('Could not fetch seat layout. Please try again.');
    }
  },

  // Lấy danh sách món ăn và đồ uống
  getFoodItems: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/api/v1/foods`);
      if (response.data?.result) {
        return response.data.result;
      } else if (Array.isArray(response.data)) {
        return { data: response.data };
      } else if (response.data?.data) {
        return response.data;
      }
      return { data: [] };
    } catch (error) {
      console.error('Error fetching food items:', error);
      return { data: [] };
    }
  },

  // Đặt vé
  createBooking: async (bookingData: BookingRequest) => {
    try {
      const response = await axiosInstance.post(BOOKING_ENDPOINTS.CREATE, bookingData);
      if (response.data?.result) {
        return response.data.result;
      }
      return response.data;
    } catch (error) {
      try {
        const response = await axiosInstance.post(BOOKING_ENDPOINTS.CREATE_ALT, bookingData);
        if (response.data?.result) {
          return response.data.result;
        }
        return response.data;
      } catch (altError) {
        console.error('All booking attempts failed:', altError);
        throw new Error('Could not create booking. Please try again.');
      }
    }
  },

  // Mô phỏng thanh toán (không cần tích hợp cổng thanh toán thật)
  simulatePayment: async (paymentData: any) => {
    try {
      const response = await axiosInstance.post(BOOKING_ENDPOINTS.SIMULATE_PAYMENT, paymentData);
      if (response.data?.result) {
        return response.data.result;
      }
      return response.data;
    } catch (error) {
      console.error('Payment simulation failed:', error);
      throw new Error('Payment simulation failed. Please try again.');
    }
  },

  // Lấy thông tin đặt vé
  getBookingDetails: async (bookingId: string | number) => {
    try {
      const response = await axiosInstance.get(`${BOOKING_ENDPOINTS.GET_DETAILS}/${bookingId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching booking details for ID ${bookingId}:`, error.message);
      throw new Error(`Could not fetch booking details: ${error.message}`);
    }
  },

  // Lấy lịch sử đặt vé của người dùng
  getUserBookings: async () => {
    const response = await axiosInstance.get(`${API_URL}/api/v1/user/bookings`);
    return response.data;
  },

  // Test booking flow
  testBookingFlow: async () => {
    try {
      console.log('Testing booking flow...');
      const response = await axiosInstance.get(BOOKING_ENDPOINTS.TEST);
      console.log('Test booking response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error testing booking flow:', error.message);
      throw new Error(`Booking test failed: ${error.message}`);
    }
  }
};

export default bookingService; 