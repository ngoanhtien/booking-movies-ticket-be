import axiosInstance from '../utils/axios';
import { ApiResponse, MovieShowtimesResponse, ShowtimeDetail, BranchWithShowtimes } from '../types/showtime';

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
  getShowtimesByMovie: async (movieId: string): Promise<MovieShowtimesResponse | null> => {
    try {
      // Cập nhật URL endpoint với tiền tố /api/v1/
      const response = await axiosInstance.get<ApiResponse<MovieShowtimesResponse>>(`/api/v1/showtimes/movies/${movieId}`);
      return response.data?.result || response.data?.data || null;
    } catch (error: unknown) {
      console.error('Error fetching showtimes by movie:', error);
      
      // Nếu API lỗi, trả về mock data để ứng dụng không bị gián đoạn
      const err = error as any; // Type assertion
      if (err.response?.status === 500) {
        console.log('Sử dụng mock data cho showtimes do lỗi server');
        return {
          movieId: parseInt(movieId),
          movieName: "Movie " + movieId,
          branches: [{
            branchId: 1,
            branchName: "CGV Landmark 81",
            showtimes: [
              {
                scheduleId: 101,
                scheduleTime: "10:00",
                roomId: 1,
                roomName: "Room 1",
                roomType: "2D",
                status: "AVAILABLE",
                date: new Date().toISOString().split('T')[0]
              },
              {
                scheduleId: 102,
                scheduleTime: "13:30",
                roomId: 2,
                roomName: "Room 2",
                roomType: "3D",
                status: "AVAILABLE",
                date: new Date().toISOString().split('T')[0]
              }
            ]
          }]
        };
      }
      
      throw error;
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
  getSeatLayout: async (scheduleId: number, roomId: number): Promise<ApiResponse<Seat[]> | null> => {
    try {
      // Cập nhật URL endpoint với tiền tố /api/v1/
      const response = await axiosInstance.get<ApiResponse<Seat[]>>(`/api/v1/seats/layout?scheduleId=${scheduleId}&roomId=${roomId}`);
      return response.data || null;
    } catch (error: unknown) {
      console.error('Error fetching seat layout:', error);
      
      // Trả về mock seat layout nếu API lỗi
      const err = error as any; // Type assertion
      if (err.response?.status === 500) {
        const mockSeats: Seat[] = [];
        const rows = ['A', 'B', 'C', 'D'];
        let id = 1;
        
        rows.forEach(row => {
          for (let i = 1; i <= 8; i++) {
            mockSeats.push({
              id: `seat-${id++}`,
              row,
              number: i,
              status: Math.random() > 0.8 ? SeatStatus.Booked : SeatStatus.Available,
              type: row === 'A' ? 'VIP' : 'REGULAR',
              price: row === 'A' ? 100000 : 70000
            });
          }
        });
        
        return { data: mockSeats };
      }
      
      throw error;
    }
  },

  // Lấy danh sách món ăn và đồ uống
  getFoodItems: async (): Promise<ApiResponse<FoodItem[]> | null> => {
    try {
      // Cập nhật URL endpoint với tiền tố /api/v1/
      const response = await axiosInstance.get<ApiResponse<FoodItem[]>>('/api/v1/food-items');
      return response.data || null;
    } catch (error: unknown) {
      console.error('Error fetching food items:', error);
      
      // Trả về mock food items nếu API lỗi
      const err = error as any; // Type assertion
      if (err.response?.status === 500) {
        return {
          data: [
            {
              id: '1',
              name: 'Popcorn (L)',
              price: 79000,
              description: 'Large size popcorn',
              imageUrl: 'https://example.com/popcorn.jpg'
            },
            {
              id: '2',
              name: 'Coca Cola (M)',
              price: 39000,
              description: 'Medium size coca cola',
              imageUrl: 'https://example.com/cola.jpg'
            },
            {
              id: '3',
              name: 'Combo 1 (Popcorn + 2 Cola)',
              price: 149000,
              description: 'Large popcorn with 2 medium cola',
              imageUrl: 'https://example.com/combo.jpg'
            }
          ]
        };
      }
      
      throw error;
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