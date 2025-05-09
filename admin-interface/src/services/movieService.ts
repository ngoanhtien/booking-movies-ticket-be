import axios from 'axios';
import { Movie } from '../types';

// Sử dụng đường dẫn tương đối thay vì URL tuyệt đối để proxy hoạt động
const API_BASE_URL = '';

export interface MovieFilters {
  status?: string;
  search?: string;
  genre?: string;
}

export interface MoviesResponse {
  content?: Movie[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  data?: Movie[] | { content: Movie[] };
  result?: Movie[] | { content: Movie[] };
}

// Hàm helper để chuẩn hóa dữ liệu phản hồi
const normalizeResponse = (responseData: any): MoviesResponse => {
  console.log("Raw API response:", responseData);
  
  // Xử lý đúng cấu trúc dữ liệu từ server
  if (responseData.data && Array.isArray(responseData.data)) {
    // Trường hợp responseData.data là một mảng (kết quả trực tiếp)
    return {
      content: responseData.data,
      totalElements: responseData.data.length,
      totalPages: 1,
      size: responseData.data.length,
      number: 0
    };
  } else if (responseData.data && responseData.data.content) {
    // Trường hợp responseData.data là một đối tượng pagination
    return responseData.data;
  } else if (responseData.result && Array.isArray(responseData.result)) {
    // Trường hợp responseData.result là một mảng
    return {
      content: responseData.result,
      totalElements: responseData.result.length,
      totalPages: 1,
      size: responseData.result.length,
      number: 0
    };
  } else if (responseData.result && responseData.result.content) {
    // Trường hợp responseData.result là một đối tượng pagination
    return responseData.result;
  } else if (Array.isArray(responseData)) {
    // Trường hợp responseData là một mảng trực tiếp
    return {
      content: responseData,
      totalElements: responseData.length,
      totalPages: 1,
      size: responseData.length,
      number: 0
    };
  } else if (responseData.content && Array.isArray(responseData.content)) {
    // Trường hợp responseData là một đối tượng pagination
    return responseData;
  }
  
  // Trường hợp không xác định được cấu trúc, trả về một cấu trúc mặc định an toàn
  console.warn("Unknown API response structure:", responseData);
  return {
    content: [],
    totalElements: 0,
    totalPages: 1,
    size: 10,
    number: 0
  };
};

export const fetchMovies = async (page = 0, size = 10, filters?: MovieFilters): Promise<MoviesResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    if (filters?.status) {
      params.append('status', filters.status);
    }
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    if (filters?.genre) {
      params.append('genre', filters.genre);
    }
    
    const response = await axios.get(`${API_BASE_URL}/movie`, { params });
    console.log("Movie API response:", response.data);
    
    return normalizeResponse(response.data);
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw new Error('Failed to fetch movies');
  }
};

export const fetchMovieDetails = async (id: string): Promise<Movie> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/detail/${id}`);
    console.log("Movie details API response:", response.data);
    
    const normalizedData = normalizeResponse(response.data);
    // Lấy phim đầu tiên nếu có, hoặc trả về một đối tượng phim trống nếu không có dữ liệu
    const movie = normalizedData.content && normalizedData.content.length > 0 
      ? normalizedData.content[0] 
      : {} as Movie;
    
    return movie;
  } catch (error) {
    console.error(`Error fetching movie details for id ${id}:`, error);
    throw new Error('Failed to fetch movie details');
  }
};

export const fetchShowingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/showing`);
    console.log("Showing movies API response:", response.data);
    
    const normalizedData = normalizeResponse(response.data);
    return normalizedData.content || [];
  } catch (error) {
    console.error('Error fetching showing movies:', error);
    throw new Error('Failed to fetch showing movies');
  }
};

export const fetchUpcomingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/upcoming`);
    console.log("Upcoming movies API response:", response.data);
    
    const normalizedData = normalizeResponse(response.data);
    return normalizedData.content || [];
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    throw new Error('Failed to fetch upcoming movies');
  }
}; 