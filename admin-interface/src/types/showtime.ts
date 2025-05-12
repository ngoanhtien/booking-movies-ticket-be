export interface ShowtimeDetail {
  scheduleId: number;
  roomId: number;
  roomName: string;
  roomType: string;
  scheduleDate: string;
  scheduleTime: string;
  scheduleEndTime: string;
}

export interface BranchWithShowtimes {
  branchId: number;
  branchName: string;
  address: string;
  hotline: string;
  imageUrl: string;
  showtimes: ShowtimeDetail[];
}

export interface MovieShowtimesResponse {
  movieId: number;
  movieName: string;
  imageUrl?: string; // Optional, as it might be part of the main movie details
  duration?: number;  // Optional
  summary?: string;   // Optional
  director?: string;  // Optional
  ageLimit?: number;  // Optional
  branches: BranchWithShowtimes[];
} 