import axios from 'axios';
import { Movie } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export interface MovieFilters {
  status?: string;
  search?: string;
  genre?: string;
}

export interface MoviesResponse {
  content: Movie[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

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
    return response.data.data;
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw new Error('Failed to fetch movies');
  }
};

export const fetchMovieDetails = async (id: string): Promise<Movie> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/detail/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching movie details for id ${id}:`, error);
    throw new Error('Failed to fetch movie details');
  }
};

export const fetchShowingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/showing`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching showing movies:', error);
    throw new Error('Failed to fetch showing movies');
  }
};

export const fetchUpcomingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/upcoming`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    throw new Error('Failed to fetch upcoming movies');
  }
}; 