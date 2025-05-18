package com.booking.movieticket.controller;

import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.RevenueByCategoryDTO;
import com.booking.movieticket.dto.response.RevenueSummaryDTO;
import com.booking.movieticket.dto.response.RevenueTimeSeriesDTO;
import com.booking.movieticket.service.RevenueAnalyticsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequestMapping("/analytics/revenue")
@CrossOrigin(origins = "*")
public class RevenueAnalyticsController {

    RevenueAnalyticsService revenueAnalyticsService;

    /**
     * Get total revenue by date within a date range
     */
    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<?>> getDailyRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting daily revenue for period: {} to {}", startDate, endDate);
        RevenueTimeSeriesDTO result = revenueAnalyticsService.getDailyRevenue(startDate, endDate);
        return ResponseEntity.ok(new ApiResponse<>("Daily revenue retrieved successfully", result));
    }

    /**
     * Get revenue by movie within a date range
     */
    @GetMapping("/by-movie")
    public ResponseEntity<ApiResponse<?>> getRevenueByMovie(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer limit) {
        log.info("Getting revenue by movie for period: {} to {}", startDate, endDate);
        RevenueByCategoryDTO result = revenueAnalyticsService.getRevenueByMovie(startDate, endDate, limit);
        return ResponseEntity.ok(new ApiResponse<>("Revenue by movie retrieved successfully", result));
    }

    /**
     * Get revenue by cinema within a date range
     */
    @GetMapping("/by-cinema")
    public ResponseEntity<ApiResponse<?>> getRevenueByCinema(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting revenue by cinema for period: {} to {}", startDate, endDate);
        RevenueByCategoryDTO result = revenueAnalyticsService.getRevenueByCinema(startDate, endDate);
        return ResponseEntity.ok(new ApiResponse<>("Revenue by cinema retrieved successfully", result));
    }

    /**
     * Get revenue by showtime (time of day) within a date range
     */
    @GetMapping("/by-showtime")
    public ResponseEntity<ApiResponse<?>> getRevenueByShowtime(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting revenue by showtime for period: {} to {}", startDate, endDate);
        RevenueByCategoryDTO result = revenueAnalyticsService.getRevenueByShowtime(startDate, endDate);
        return ResponseEntity.ok(new ApiResponse<>("Revenue by showtime retrieved successfully", result));
    }

    /**
     * Get revenue by ticket type within a date range
     */
    @GetMapping("/by-ticket-type")
    public ResponseEntity<ApiResponse<?>> getRevenueByTicketType(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting revenue by ticket type for period: {} to {}", startDate, endDate);
        RevenueByCategoryDTO result = revenueAnalyticsService.getRevenueByTicketType(startDate, endDate);
        return ResponseEntity.ok(new ApiResponse<>("Revenue by ticket type retrieved successfully", result));
    }

    /**
     * Get summary revenue statistics for a date range
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<?>> getRevenueSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting revenue summary for period: {} to {}", startDate, endDate);
        RevenueSummaryDTO result = revenueAnalyticsService.getRevenueSummary(startDate, endDate);
        return ResponseEntity.ok(new ApiResponse<>("Revenue summary retrieved successfully", result));
    }
}