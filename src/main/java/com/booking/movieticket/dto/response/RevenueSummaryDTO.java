package com.booking.movieticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// For time range summary data
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueSummaryDTO {
    private Double totalRevenue;
    private Integer totalTickets;
    private Integer totalMovies;
    private Integer totalShowtimes;
    private LocalDate startDate;
    private LocalDate endDate;
}
