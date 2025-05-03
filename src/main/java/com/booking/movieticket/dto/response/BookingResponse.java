package com.booking.movieticket.dto.response;

import com.booking.movieticket.entity.enums.RoomType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingResponse {
    private Long bookingId;
    private String bookingCode;
    private MovieInfo movie;
    private CinemaInfo cinema;
    private List<String> seats;
    private Double totalAmount;
    private List<FoodItem> foodItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MovieInfo {
        private Long movieId;
        private String movieName;
        private RoomType format;
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CinemaInfo {
        private String cinemaName;
        private String roomName;
        private String address;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FoodItem {
        private String name;
        private Integer quantity;
        private Double price;
    }
}