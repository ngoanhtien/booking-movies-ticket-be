package com.booking.movieticket.dto.response;

import com.booking.movieticket.entity.enums.RoomType;
import com.booking.movieticket.entity.enums.StatusSeat;
import com.booking.movieticket.entity.enums.TypeSeat;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeDetailResponse {
    private ShowtimeIdentifier showtime;
    private MovieInfo movie;
    private ScheduleInfo schedule;
    private RoomInfo room;
    @Builder.Default
    private List<SeatInfo> seats = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShowtimeIdentifier {
        private Long scheduleId;
        private Long roomId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovieInfo {
        private Long id;
        private String name;
        private Integer duration;
        private Integer ageLimit;
        private String language;
        private String imageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScheduleInfo {
        private Long id;

        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate date;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime timeStart;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime timeEnd; // Được tính dựa trên thời lượng phim
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomInfo {
        private Long id;
        private String name;
        private RoomType roomType;
        private Integer seatRowNumbers;
        private Integer seatColumnNumbers;
        private Integer aislePosition;
        private String branchName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatInfo {
        private Long id;
        private String rowName;
        private String columnName;
        private String rowScreenLabel;
        private String columnScreenLabel;
        private TypeSeat typeSeat;
        private StatusSeat status;
        private Double price;
    }
}