package com.booking.movieticket.dto.response;

import com.booking.movieticket.entity.enums.BookingStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingHistoryResponse {
    private Long bookingId;
    private String bookingCode;
    private LocalDateTime bookingTime;
    private Double totalAmount;
    private BookingStatus status;
    private String paymentMethod;
    private String paymentStatus;
    
    private MovieInfo movie;
    private CinemaInfo cinema;
    private List<String> seats;
    private List<FoodItem> foodItems;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MovieInfo {
        private Long movieId;
        private String movieName;
        private String format;
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
    }
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CinemaInfo {
        private String cinemaName;
        private String roomName;
        private String address;
    }
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FoodItem {
        private String name;
        private Integer quantity;
        private Double price;
    }
} 