package com.booking.movieticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

// Base class for time-series data
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueTimeSeriesDTO {
    private List<DateRevenuePoint> dataPoints;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DateRevenuePoint {
        private LocalDate date;
        private Double revenue;
        private Integer ticketCount;
    }
}