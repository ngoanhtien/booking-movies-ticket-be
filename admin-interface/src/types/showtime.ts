export interface ApiResponse<T> {
  status: string;
  message: string;
  result?: T;
  data?: T;
}

export interface ShowtimeDetail {
  scheduleId: number;
  roomId: number;
  roomName: string;
  roomType: string;
  scheduleTime: string; 
  scheduleDate?: string;
  status?: string;
  date?: string;
}

export interface BranchWithShowtimes {
  branchId: number;
  branchName: string;
  showtimes: ShowtimeDetail[];
  address?: string;
  hotline?: string;
  branchAddress?: string;
  imageUrl?: string;
}

export interface MovieShowtimesResponse {
  movieId: number;
  movieName: string;
  branches: BranchWithShowtimes[];
  imageUrl?: string;
  duration?: number;
  summary?: string;
  director?: string;
  ageLimit?: number;
}

export interface Showtime {
  id?: string;
  time: string;
  roomName: string;
  availableSeats?: number;
  price?: number;
  movieId?: number;
  movieName?: string;
  roomId?: number;
  scheduleId?: number;
  date?: string;
}

// Interface cho phản hồi API showtimes theo ngày
export interface ShowtimesByDateResponse {
  date: string;
  showtimes: Showtime[];
}

// Thêm các interface khác liên quan đến showtime ở đây 