export interface ApiResponse<T> {
  result?: T;
  data?: T;
  status?: string;
  message?: string;
  code?: number;
}

export interface ShowtimeDetail {
  scheduleId: number;
  scheduleTime: string;
  roomId: number;
  roomName: string;
  roomType: string;
  status: string;
  date: string;
  scheduleDate?: string;
  scheduleEndTime?: string;
}

export interface BranchWithShowtimes {
  branchId: number;
  branchName: string;
  address?: string;
  hotline?: string;
  imageUrl?: string;
  showtimes: ShowtimeDetail[];
}

export interface MovieShowtimesResponse {
  movieId: number;
  movieName: string;
  imageUrl?: string;
  duration?: number;
  summary?: string;
  director?: string;
  ageLimit?: number;
  branches: BranchWithShowtimes[];
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