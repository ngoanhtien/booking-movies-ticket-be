import axios from 'axios';
import { Movie } from '../types/movie';

// Interface cho lịch chiếu
export interface Showtime {
  id: number;
  scheduleId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
  isDeleted: boolean;
  schedule?: {
    id: number;
    movieId: number;
    movie?: Movie;
  };
  room?: {
    id: number;
    name: string;
    capacity: number;
    type: string;
    branchId: number;
    branch?: {
      id: number;
      name: string;
      cinemaId: number;
      cinema?: {
        id: number;
        name: string;
      };
    };
  };
}

// Interface cho API response
export interface ShowtimeResponse {
  content: Showtime[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Interface cho filter lịch chiếu
export interface ShowtimeFilter {
  movieId?: number;
  branchId?: number;
  roomId?: number;
  date?: string;
  status?: string;
}

const API_BASE_URL = '/api/v1'; // Đường dẫn tương đối cho proxy

export const showtimeService = {
  // Lấy tất cả lịch chiếu với phân trang và filter
  getAllShowtimes: async (page = 0, size = 10, filter?: ShowtimeFilter): Promise<ShowtimeResponse> => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());

      if (filter) {
        if (filter.movieId) params.append('movieId', filter.movieId.toString());
        if (filter.branchId) params.append('branchId', filter.branchId.toString());
        if (filter.roomId) params.append('roomId', filter.roomId.toString());
        if (filter.date) params.append('date', filter.date);
        if (filter.status) params.append('status', filter.status);
      }

      console.log(`[showtimeService] Fetching showtimes with params:`, Object.fromEntries(params));
      
      const response = await axios.get(`${API_BASE_URL}/showtime/admin`, { params });
      console.log('[showtimeService] Response received:', response.data);
      
      // Xử lý response
      if (response.data && response.data.result) {
        return response.data.result;
      } else if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('[showtimeService] Error fetching showtimes:', error);
      throw error;
    }
  },

  // Lấy chi tiết lịch chiếu theo ID
  getShowtimeById: async (id: number): Promise<Showtime> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/showtime/${id}`);
      
      if (response.data && response.data.result) {
        return response.data.result;
      } else if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error(`[showtimeService] Error fetching showtime #${id}:`, error);
      throw error;
    }
  },

  // Tạo lịch chiếu mới
  createShowtime: async (showtimeData: Partial<Showtime>): Promise<Showtime> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/showtime`, showtimeData);
      
      if (response.data && response.data.result) {
        return response.data.result;
      } else if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('[showtimeService] Error creating showtime:', error);
      throw error;
    }
  },

  // Cập nhật lịch chiếu
  updateShowtime: async (id: number, showtimeData: Partial<Showtime>): Promise<Showtime> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/showtime/${id}`, showtimeData);
      
      if (response.data && response.data.result) {
        return response.data.result;
      } else if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error(`[showtimeService] Error updating showtime #${id}:`, error);
      throw error;
    }
  },

  // Xóa (vô hiệu hóa) lịch chiếu
  deleteShowtime: async (id: number): Promise<boolean> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/showtime/${id}`);
      return response.status === 200;
    } catch (error) {
      console.error(`[showtimeService] Error deleting showtime #${id}:`, error);
      throw error;
    }
  },

  // Tạo lịch chiếu cho tất cả phim đang chiếu
  generateShowtimesForActiveMovies: async (): Promise<string> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/showtime/admin/generate-showtimes`);
      
      if (response.data && response.data.result) {
        return response.data.result;
      } else if (response.data && response.data.message) {
        return response.data.message;
      }
      
      return 'Showtimes generation completed';
    } catch (error) {
      console.error('[showtimeService] Error generating showtimes:', error);
      throw error;
    }
  },

  // Lấy lịch chiếu theo phim và ngày
  getShowtimesByMovieAndDate: async (movieId: number, date: string): Promise<Showtime[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/showtime/${movieId}/by-date`, {
        params: { date }
      });
      
      if (response.data && response.data.result) {
        return response.data.result;
      } else if (response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error(`[showtimeService] Error fetching showtimes for movie #${movieId} on ${date}:`, error);
      throw error;
    }
  }
};

export default showtimeService; 