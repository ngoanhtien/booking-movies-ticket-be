import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

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

export const bookingService = {
  // Lấy danh sách suất chiếu theo phim
  getShowtimesByMovie: async (movieId: string) => {
    try {
      const response = await axios.get(`${API_URL}/showtimes/movie/${movieId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      throw error;
    }
  },

  // Lấy danh sách tất cả suất chiếu có sẵn
  getAllShowtimes: async () => {
    try {
      const response = await axios.get(`${API_URL}/showtimes/available`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all showtimes:', error);
      throw error;
    }
  },

  // Lấy sơ đồ ghế cho một suất chiếu
  getSeatLayout: async (scheduleId: number, roomId: number) => {
    try {
      const response = await axios.get(`${API_URL}/seats/showtime`, {
        params: { scheduleId, roomId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching seat layout:', error);
      throw error;
    }
  },

  // Lấy danh sách món ăn và đồ uống
  getFoodItems: async () => {
    try {
      const response = await axios.get(`${API_URL}/foods`);
      return response.data;
    } catch (error) {
      console.error('Error fetching food items:', error);
      throw error;
    }
  },

  // Đặt vé
  createBooking: async (bookingData: BookingRequest) => {
    try {
      const response = await axios.post(`${API_URL}/bookings`, bookingData, {
        headers: {
          'Content-Type': 'application/json',
          // Nếu cần thêm token xác thực
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Mô phỏng thanh toán (không cần tích hợp cổng thanh toán thật)
  simulatePayment: async (bookingId: number, paymentMethod: string) => {
    try {
      // Đây là API giả lập thanh toán, không cần kết nối với cổng thanh toán thật
      const response = await axios.post(`${API_URL}/payments/simulate`, {
        bookingId,
        paymentMethod,
        amount: 0, // Số tiền sẽ được lấy từ booking
        status: 'SUCCESS' // Luôn trả về thành công trong môi trường giả lập
      });
      return response.data;
    } catch (error) {
      console.error('Error simulating payment:', error);
      throw error;
    }
  },

  // Lấy thông tin đặt vé
  getBookingDetails: async (bookingId: number) => {
    try {
      const response = await axios.get(`${API_URL}/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  },

  // Lấy lịch sử đặt vé của người dùng
  getUserBookings: async () => {
    try {
      const response = await axios.get(`${API_URL}/user/bookings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user booking history:', error);
      throw error;
    }
  }
};

export default bookingService; 