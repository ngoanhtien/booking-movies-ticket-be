import axios from 'axios';
import { Movie, Actor as MovieActor, Review as MovieReview } from '../types';
import { MovieShowtimesResponse } from '../types/showtime';

// Sử dụng đường dẫn tương đối thay vì URL tuyệt đối để proxy hoạt động
const API_BASE_URL = '';

export interface MovieFilters {
  status?: string;
  searchTerm?: string;
  genre?: string;
}

export interface MoviesResponse {
  content?: Movie[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

const normalizeResponse = (parsedData: any): MoviesResponse => {
  console.log("[normalizeResponse] Processing parsed data. Type:", typeof parsedData);
  if (parsedData && typeof parsedData === 'object') {
    console.log("[normalizeResponse] Parsed data keys:", Object.keys(parsedData));
    if (parsedData.result) {
      console.log("[normalizeResponse] Parsed data.result type:", typeof parsedData.result);
      if (typeof parsedData.result === 'object' && parsedData.result !== null) {
        console.log("[normalizeResponse] Parsed data.result keys:", Object.keys(parsedData.result));
        if (parsedData.result.content) {
          console.log("[normalizeResponse] Parsed data.result.content type:", typeof parsedData.result.content);
          console.log("[normalizeResponse] Is parsedData.result.content an array?", Array.isArray(parsedData.result.content));
        } else {
          console.log("[normalizeResponse] parsedData.result.content is missing.");
        }
      }
    } else {
      console.log("[normalizeResponse] parsedData.result is missing.");
    }
  }
  console.log("[normalizeResponse] Full parsed data (first 700 chars):", JSON.stringify(parsedData).substring(0, 700));
  const allMovies: Movie[] = [];
  const seenMovieIds = new Set<number>();

  const addMovieSafely = (movieData: any) => {
    if (movieData && movieData.id && (movieData.name || movieData.title)) {
      if (!seenMovieIds.has(movieData.id)) {
        seenMovieIds.add(movieData.id);
        allMovies.push({
          id: movieData.id,
          name: movieData.name || movieData.title,
          summary: movieData.summary,
          director: movieData.director,
          status: movieData.status,
          duration: movieData.duration,
          language: movieData.language,
          ageLimit: movieData.ageLimit,
          releasedDate: movieData.releasedDate,
          imageSmallUrl: movieData.imageSmallUrl,
          imageLargeUrl: movieData.imageLargeUrl,
          trailerUrl: movieData.trailerUrl,
          categories: movieData.categories || [],
          schedules: movieData.schedules || [],
        } as Movie);
        console.log(`[normalizeResponse] Added movie: ID=${movieData.id}, Name='${movieData.name || movieData.title}'`);
      } else {
        console.log(`[normalizeResponse] Skipped duplicate movie: ID=${movieData.id}`);
      }
    } else {
      console.warn("[normalizeResponse] Skipped invalid movie data (missing id, name, or title):", JSON.stringify(movieData).substring(0,200));
    }
  };

  // Ưu tiên cấu trúc responseData.result.content
  if (parsedData?.result?.content && Array.isArray(parsedData.result.content)) {
    console.log("[normalizeResponse] Found 'result.content' array. Processing items:", parsedData.result.content.length);
    for (const movie of parsedData.result.content) {
      addMovieSafely(movie); // Thêm phim chính
      // Xử lý phim trong categories nếu có
      if (movie.categories && Array.isArray(movie.categories)) {
        for (const category of movie.categories) {
          if (category.movies && Array.isArray(category.movies)) {
            console.log(`[normalizeResponse] Processing movies in category: ${category.name}`);
            for (const catMovie of category.movies) {
              addMovieSafely(catMovie);
            }
          }
        }
      }
    }
  } 
  // Các trường hợp fallback khác (có thể thêm lại nếu cần)
  else if (parsedData?.data?.content && Array.isArray(parsedData.data.content)) {
    console.log("[normalizeResponse] Fallback: Found 'data.content' array. Processing items:", parsedData.data.content.length);
    for (const movie of parsedData.data.content) addMovieSafely(movie);
  } else if (parsedData?.data && Array.isArray(parsedData.data)) {
    console.log("[normalizeResponse] Fallback: Found 'data' array. Processing items:", parsedData.data.length);
    for (const movie of parsedData.data) addMovieSafely(movie);
  } else if (parsedData?.result && Array.isArray(parsedData.result)) { // This might be problematic if result is an object not an array
    console.log("[normalizeResponse] Fallback: Found 'result' array. Processing items:", parsedData.result.length);
    for (const movie of parsedData.result) addMovieSafely(movie);
  } else if (Array.isArray(parsedData)) {
    console.log("[normalizeResponse] Fallback: Found direct array. Processing items:", parsedData.length);
    for (const movie of parsedData) addMovieSafely(movie);
  } else {
    console.warn("[normalizeResponse] No recognizable movie array structure found in parsed data.");
  }

  if (allMovies.length > 0) {
    console.log(`[normalizeResponse] ✓ Successfully extracted ${allMovies.length} unique movies.`);
    return {
      content: allMovies,
      totalElements: parsedData?.result?.totalElements || parsedData?.data?.totalElements || allMovies.length,
      totalPages: parsedData?.result?.totalPages || parsedData?.data?.totalPages || 1,
      size: parsedData?.result?.size || parsedData?.data?.size || allMovies.length,
      number: parsedData?.result?.number !== undefined ? parsedData.result.number : (parsedData?.data?.number !== undefined ? parsedData.data.number : 0),
    };
  }

  console.error("[normalizeResponse] ERROR: Could not extract any movie data.");
  return {
    content: [],
    totalElements: 0,
    totalPages: 0, // Nên là 0 nếu không có phim
    size: 10,      // Hoặc size từ request
    number: 0,
  };
};

export const fetchMovies = async (page = 0, size = 10, filters?: MovieFilters): Promise<MoviesResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters?.genre) params.append('genre', filters.genre);
    
    console.log(`[fetchMovies] Requesting /movie with params:`, Object.fromEntries(params));
    
    const response = await axios.get(`${API_BASE_URL}/movie`, { params });
    
    console.log("[fetchMovies] Response received. Raw data type:", typeof response.data);
    
    let parsedResponseData;
    if (typeof response.data === 'string') {
      try {
        parsedResponseData = JSON.parse(response.data);
        console.log("[fetchMovies] Successfully parsed string response data.");
      } catch (e: any) {
        console.error("[fetchMovies] Failed to parse string response data:", e.message);
        let errorPosition = -1;
        if (e.message && e.message.includes('position')) {
          const match = e.message.match(/position (\d+)/);
          if (match && match[1]) {
            errorPosition = parseInt(match[1], 10);
          }
        }
        if (errorPosition !== -1) {
          const contextChars = 100;
          const start = Math.max(0, errorPosition - contextChars);
          const end = Math.min(response.data.length, errorPosition + contextChars);
          console.error(`[fetchMovies] Context around error position ${errorPosition} (chars ${start}-${end}):`, response.data.substring(start, end));
        } else {
          console.error("[fetchMovies] Raw string data causing parse error (first 2000 chars):", response.data.substring(0,2000));
        }
        console.error("[fetchMovies] Full error stack:", e.stack);
        return {
          content: [], totalElements: 0, totalPages: 0, size: size, number: page
        };
      }
    } else {
      parsedResponseData = response.data; // Assume it's already an object
      console.log("[fetchMovies] Response data is already an object.");
    }
    
    return normalizeResponse(parsedResponseData);

  } catch (error: any) {
    console.error('[fetchMovies] Error during API call or normalization:', error.message);
    return {
      content: [], totalElements: 0, totalPages: 0, size: size, number: page
    };
  }
};

export const fetchMovieDetails = async (id: string): Promise<Movie | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/detail/${id}`);
    console.log("[fetchMovieDetails] Raw API response for ID", id, ":", response.data);
    
    // Handle different response types
    let responseData = response.data;
    
    // Extract movie data from the response
    if (responseData && typeof responseData === 'object') {
      // Case 1: Standard format with result property
      if (responseData.result && typeof responseData.result === 'object') {
        const movieData = responseData.result;
        return {
          id: movieData.id,
          title: movieData.name || movieData.title,
          name: movieData.name || '',
          description: movieData.summary || movieData.description || '',
          descriptionLong: movieData.descriptionLong || movieData.description || movieData.summary || '',
          posterUrl: movieData.imageSmallUrl || movieData.imageLargeUrl || '',
          imageLargeUrl: movieData.imageLargeUrl || movieData.imageSmallUrl || '',
          imageSmallUrl: movieData.imageSmallUrl || movieData.imageLargeUrl || '',
          releaseDate: movieData.releasedDate || movieData.releaseDate || '',
          director: movieData.director || '',
          duration: movieData.duration || 0,
          ageLimit: movieData.ageLimit || 0,
          language: movieData.language || '',
          trailerUrl: movieData.trailerUrl || '',
          status: movieData.status || '',
          categories: Array.isArray(movieData.categories) ? movieData.categories : [],
          schedules: Array.isArray(movieData.schedules) ? movieData.schedules : [],
          actors: Array.isArray(movieData.actors) ? movieData.actors : [],
          reviews: Array.isArray(movieData.reviews) ? movieData.reviews.map((apiReview: any) => ({
            id: apiReview.id,
            numberStar: apiReview.numberStar,
            comment: apiReview.comment,
            user: {
                id: apiReview.user?.id,
                username: apiReview.user?.username,
                fullname: apiReview.user?.fullname,
                avatarUrl: apiReview.user?.avatarUrl
            },
            numberLike: apiReview.numberLike,
            createdBy: apiReview.createdBy,
            createdAt: apiReview.createdAt,
            lastModifiedBy: apiReview.lastModifiedBy,
            lastModifiedAt: apiReview.lastModifiedAt,
            isDeleted: apiReview.isDeleted
          })) : []
        };
      }
      
      // Case 2: Direct movie data
      if (responseData.id && (responseData.name || responseData.title)) {
        return {
          id: responseData.id,
          title: responseData.name || responseData.title,
          name: responseData.name || '',
          description: responseData.summary || responseData.description || '',
          descriptionLong: responseData.descriptionLong || responseData.description || responseData.summary || '',
          posterUrl: responseData.imageSmallUrl || responseData.imageLargeUrl || '',
          imageLargeUrl: responseData.imageLargeUrl || responseData.imageSmallUrl || '',
          imageSmallUrl: responseData.imageSmallUrl || responseData.imageLargeUrl || '',
          releaseDate: responseData.releasedDate || responseData.releaseDate || '',
          director: responseData.director || '',
          duration: responseData.duration || 0,
          ageLimit: responseData.ageLimit || 0,
          language: responseData.language || '',
          trailerUrl: responseData.trailerUrl || '',
          status: responseData.status || '',
          categories: Array.isArray(responseData.categories) ? responseData.categories : [],
          schedules: Array.isArray(responseData.schedules) ? responseData.schedules : [],
          actors: Array.isArray(responseData.actors) ? responseData.actors : [],
          reviews: Array.isArray(responseData.reviews) ? responseData.reviews.map((apiReview: any) => ({
            id: apiReview.id,
            numberStar: apiReview.numberStar,
            comment: apiReview.comment,
            user: {
                id: apiReview.user?.id,
                username: apiReview.user?.username,
                fullname: apiReview.user?.fullname,
                avatarUrl: apiReview.user?.avatarUrl
            },
            numberLike: apiReview.numberLike,
            createdBy: apiReview.createdBy,
            createdAt: apiReview.createdAt,
            lastModifiedBy: apiReview.lastModifiedBy,
            lastModifiedAt: apiReview.lastModifiedAt,
            isDeleted: apiReview.isDeleted
          })) : []
        };
      }
    }
    
    console.error("[fetchMovieDetails] Failed to extract movie data from response:", responseData);
    return null;
  } catch (error) {
    console.error(`[fetchMovieDetails] Error fetching details for movie ${id}:`, error);
    return null;
  }
};

export const fetchShowingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/showing`);
    console.log("[fetchShowingMovies] Raw API response object (typeof):", typeof response.data);
    console.log("[fetchShowingMovies] Raw API response data:", response.data);

    // Handle API response regardless of format
    let moviesData;
    
    // Check if we have a wrapper object with 'result' property
    if (response.data && typeof response.data === 'object') {
      // Case 1: { message, result: [] }
      if (response.data.result && Array.isArray(response.data.result)) {
        console.log("[fetchShowingMovies] Found result array with", response.data.result.length, "items");
        moviesData = response.data.result;
      }
      // Case 2: Direct array of movies
      else if (Array.isArray(response.data)) {
        console.log("[fetchShowingMovies] Found direct array with", response.data.length, "items");
        moviesData = response.data;
      }
      // Case 3: { message, result: { content: [] } }
      else if (response.data.result && response.data.result.content && Array.isArray(response.data.result.content)) {
        console.log("[fetchShowingMovies] Found result.content array with", response.data.result.content.length, "items");
        moviesData = response.data.result.content;
      }
      // Case 4: Fallback to normalizeResponse function
      else {
        console.log("[fetchShowingMovies] No direct array found, using normalizeResponse");
        const normalized = normalizeResponse(response.data);
        return normalized.content || [];
      }
    } else {
      console.error("[fetchShowingMovies] Unexpected response format");
      return [];
    }
    
    // Convert movie data to Movie objects
    return moviesData.map((movie: any) => ({
      id: movie.id,
      name: movie.name || movie.title || '',
      title: movie.name || movie.title || '',
      description: movie.summary || movie.description || '',
      descriptionLong: movie.descriptionLong || movie.description || movie.summary || '',
      director: movie.director || '',
      status: movie.status || '',
      duration: movie.duration || 0,
      language: movie.language || '',
      ageLimit: movie.ageLimit || 0,
      releasedDate: movie.releasedDate || movie.releaseDate || '',
      imageSmallUrl: movie.imageSmallUrl || '',
      imageLargeUrl: movie.imageLargeUrl || '',
      trailerUrl: movie.trailerUrl || '',
      categories: Array.isArray(movie.categories) ? movie.categories : [],
      schedules: Array.isArray(movie.schedules) ? movie.schedules : []
    }));
  } catch (error) {
    console.error('[fetchShowingMovies] Error fetching showing movies:', error);
    return [];
  }
};

export const fetchUpcomingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/upcoming`);
    console.log("[fetchUpcomingMovies] Raw API response object (typeof):", typeof response.data);
    console.log("[fetchUpcomingMovies] Raw API response data:", response.data);
    
    // Handle API response regardless of format
    let moviesData;
    
    // Check if we have a wrapper object with 'result' property
    if (response.data && typeof response.data === 'object') {
      // Case 1: { message, result: [] }
      if (response.data.result && Array.isArray(response.data.result)) {
        console.log("[fetchUpcomingMovies] Found result array with", response.data.result.length, "items");
        moviesData = response.data.result;
      }
      // Case 2: Direct array of movies
      else if (Array.isArray(response.data)) {
        console.log("[fetchUpcomingMovies] Found direct array with", response.data.length, "items");
        moviesData = response.data;
      }
      // Case 3: { message, result: { content: [] } }
      else if (response.data.result && response.data.result.content && Array.isArray(response.data.result.content)) {
        console.log("[fetchUpcomingMovies] Found result.content array with", response.data.result.content.length, "items");
        moviesData = response.data.result.content;
      }
      // Case 4: Fallback to normalizeResponse function
      else {
        console.log("[fetchUpcomingMovies] No direct array found, using normalizeResponse");
        const normalized = normalizeResponse(response.data);
        return normalized.content || [];
      }
    } else {
      console.error("[fetchUpcomingMovies] Unexpected response format");
      return [];
    }
    
    // Convert movie data to Movie objects
    return moviesData.map((movie: any) => ({
      id: movie.id,
      name: movie.name || movie.title || '',
      title: movie.name || movie.title || '',
      description: movie.summary || movie.description || '',
      descriptionLong: movie.descriptionLong || movie.description || movie.summary || '',
      director: movie.director || '',
      status: movie.status || '',
      duration: movie.duration || 0,
      language: movie.language || '',
      ageLimit: movie.ageLimit || 0,
      releasedDate: movie.releasedDate || movie.releaseDate || '',
      imageSmallUrl: movie.imageSmallUrl || '',
      imageLargeUrl: movie.imageLargeUrl || '',
      trailerUrl: movie.trailerUrl || '',
      categories: Array.isArray(movie.categories) ? movie.categories : [],
      schedules: Array.isArray(movie.schedules) ? movie.schedules : []
    }));
  } catch (error) {
    console.error('[fetchUpcomingMovies] Error fetching upcoming movies:', error);
    return [];
  }
};

export const fetchShowtimesByMovie = async (movieId: string, date?: string): Promise<MovieShowtimesResponse> => {
  try {
    // The API endpoint from network logs was /showtime/{id}/by-date
    // It did not seem to take a date parameter in the query string in that specific log,
    // but it's common for such an endpoint to accept one. Adding it as optional.
    const endpoint = date ? `${API_BASE_URL}/api/v1/showtime/${movieId}/by-date?date=${date}` : `${API_BASE_URL}/api/v1/showtime/${movieId}/by-date`;
    console.log(`[fetchShowtimesByMovie] Requesting ${endpoint}`);
    const response = await axios.get(endpoint);
    
    console.log(`[fetchShowtimesByMovie] Raw API response for movie ID ${movieId}:`, response.data);

    if (response.data && response.data.result && typeof response.data.result === 'object') {
      // Assuming the actual showtimes data is in response.data.result as per network log structure
      return response.data.result as MovieShowtimesResponse;
    }
    // Fallback if result is directly the data (less likely based on logs but good for robustness)
    if (response.data && typeof response.data === 'object' && response.data.branches) {
        return response.data as MovieShowtimesResponse;
    }

    console.error('[fetchShowtimesByMovie] Unexpected response structure:', response.data);
    throw new Error('Failed to fetch showtimes or data format is incorrect');

  } catch (error: any) {
    console.error(`[fetchShowtimesByMovie] Error fetching showtimes for movie ID ${movieId}:`, error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error('[fetchShowtimesByMovie] Axios error response:', error.response.data);
    }
    // Propagate a more specific error or a generic one
    throw new Error(error.response?.data?.message || `Failed to fetch showtimes for movie ${movieId}`);
  }
};

// Thêm hàm upload ảnh phim đến Cloudinary thông qua backend API
export const uploadMovieImage = async (movieId: number, imageFile: File, imageType: 'small' | 'large'): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('movieId', movieId.toString());
    formData.append('imageType', imageType);

    const response = await axios.post(`${API_BASE_URL}/movie/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data?.result?.imageUrl) {
      return response.data.result.imageUrl;
    } else if (response.data?.data?.imageUrl) {
      return response.data.data.imageUrl;
    } else if (typeof response.data === 'string') {
      return response.data;
    }
    
    throw new Error('No image URL returned from server');
  } catch (error: any) {
    console.error(`Error uploading movie ${imageType} image:`, error.message);
    throw new Error(`Failed to upload movie image: ${error.message}`);
  }
};

// Interface for the review submission
export interface ReviewSubmission {
  movieId: string; // Should match what the backend ReviewRequest expects if it needs movieId in body
  rating: number;
  comment: string;
}

// Assumed Review type, align with your actual backend ReviewResponse
// This was already present in src/types/index.ts based on previous interactions
// export interface Review {
//   id: string | number;
//   username: string;
//   rating: number;
//   comment: string;
//   createdAt: string;
//   user?: { avatarUrl?: string }; 
// }

export const checkCanReview = async (movieId: string): Promise<boolean> => {
  try {
    console.log(`[checkCanReview] Checking eligibility for movie ID: ${movieId}`);
    // The backend controller has /reviews/movie/{movieId}/can-review
    const response = await axios.get(`${API_BASE_URL}/reviews/movie/${movieId}/can-review`);
    console.log(`[checkCanReview] Eligibility response for movie ${movieId}:`, response.data);
    if (response.data && typeof response.data.result === 'boolean') {
      return response.data.result;
    }
    // Fallback if the structure is just { data: boolean } or similar, adjust as needed
    if (response.data && typeof response.data.data === 'boolean') {
      return response.data.data;
    }
    if (typeof response.data === 'boolean') { // Direct boolean response
        return response.data;
    }
    console.warn('[checkCanReview] Unexpected response structure for eligibility check.');
    return false; // Default to false if response is not as expected
  } catch (error: any) {
    console.error(`[checkCanReview] Error checking review eligibility for movie ${movieId}:`, error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error('[checkCanReview] Axios error response:', error.response.data);
      // Optionally, you might want to return false or throw a more specific error
      // based on the error.response.status if it's e.g. 401 (Unauthorized) or 403 (Forbidden)
    }
    return false; // Default to false on error
  }
};

export const submitReview = async (movieId: string, rating: number, comment: string): Promise<MovieReview | null> => {
  try {
    const reviewData: ReviewSubmission = {
      movieId: movieId, // Backend's ReviewRequest DTO expects movieId, rating, comment
      rating: rating,
      comment: comment,
    };
    console.log(`[submitReview] Submitting review for movie ID ${movieId}:`, reviewData);
    // The backend controller has POST /reviews
    const response = await axios.post(`${API_BASE_URL}/reviews`, reviewData);
    console.log(`[submitReview] Submit review response for movie ${movieId}:`, response.data);

    if (response.data && response.data.result) {
      // Assuming the response.data.result is the created ReviewResponse object
      // Need to map it to MovieReview type if they differ
      const backendReview = response.data.result;
      return {
        id: backendReview.id,
        numberStar: backendReview.rating, // Map rating to numberStar
        comment: backendReview.comment,
        user: {
            id: backendReview.userId,
            username: backendReview.username,
            // avatarUrl might not be in ReviewResponse, get from user context or leave undefined
        },
        // likes, createdAt etc. might also be in backendReview and can be mapped
        numberLike: backendReview.likes !== undefined ? backendReview.likes : 0,
        createdAt: backendReview.createdAt,
      } as MovieReview; // Cast to MovieReview, ensure all fields match or are optional
    }
    if (response.data && response.data.data) { // Fallback for { data: ReviewResponse }
        const backendReview = response.data.data;
         return {
            id: backendReview.id,
            numberStar: backendReview.rating,
            comment: backendReview.comment,
            user: { id: backendReview.userId, username: backendReview.username },
            numberLike: backendReview.likes !== undefined ? backendReview.likes : 0,
            createdAt: backendReview.createdAt,
        } as MovieReview;
    }
    console.warn('[submitReview] Unexpected response structure after submitting review.');
    return null;
  } catch (error: any) {
    console.error(`[submitReview] Error submitting review for movie ${movieId}:`, error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error('[submitReview] Axios error response:', error.response.data);
      // You might want to throw an error with message from response.data.message
      // to display it in the UI
      if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw error; // Re-throw the error to be caught by useMutation in the component
  }
}; 