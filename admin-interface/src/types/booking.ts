// Booking data types

export interface MovieInfo {
  movieId: number;
  movieName: string;
  date: string;
  startTime: string;
  endTime?: string;
  time?: string;
}

export interface CinemaInfo {
  cinemaName: string;
  roomName: string;
  address?: string;
}

export interface FoodItemInfo {
  id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface BookingData {
  bookingId: number;
  status: string;
  movie: MovieInfo;
  cinema: CinemaInfo;
  seats: string[];
  totalAmount: number;
  foodItems?: FoodItemInfo[];
}

export interface PaymentData {
  paymentId: number;
  status: string;
  amount: number;
} 