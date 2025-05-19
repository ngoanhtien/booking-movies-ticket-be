package com.booking.movieticket.service;

import com.booking.movieticket.dto.response.RevenueByCategoryDTO;
import com.booking.movieticket.dto.response.RevenueSummaryDTO;
import com.booking.movieticket.dto.response.RevenueTimeSeriesDTO;

import java.time.LocalDate;

public interface RevenueAnalyticsService {
    // Get total revenue by date within a date range
    RevenueTimeSeriesDTO getDailyRevenue(LocalDate startDate, LocalDate endDate);

    // Get revenue by movie within a date range
    RevenueByCategoryDTO getRevenueByMovie(LocalDate startDate, LocalDate endDate, Integer limit);

    // Get revenue by cinema within a date range
    RevenueByCategoryDTO getRevenueByCinema(LocalDate startDate, LocalDate endDate);

    // Get revenue by showtime within a date range (grouped by time slot)
    RevenueByCategoryDTO getRevenueByShowtime(LocalDate startDate, LocalDate endDate);

    // Get revenue by seat type within a date range
    RevenueByCategoryDTO getRevenueByTicketType(LocalDate startDate, LocalDate endDate);

    // Get summary statistics for a date range
    RevenueSummaryDTO getRevenueSummary(LocalDate startDate, LocalDate endDate);
}