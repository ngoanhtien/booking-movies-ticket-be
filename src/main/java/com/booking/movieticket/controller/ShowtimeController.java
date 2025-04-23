package com.booking.movieticket.controller;

import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.ShowtimeResponse;
import com.booking.movieticket.service.ShowtimeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequestMapping("/showtime")
@CrossOrigin(origins = "*")
public class ShowtimeController {

    ShowtimeService showtimeService;

    /**
     * Get all showtimes for a specific movie
     * @param movieId ID of the movie
     * @return API response with showtimes organized by branch
     */
    @GetMapping("/{movieId}")
    public ResponseEntity<ApiResponse<?>> getShowtimesByMovie(@PathVariable Long movieId) {
        log.info("Fetching showtimes for movie with ID: {}", movieId);
        ShowtimeResponse showtimeResponse = showtimeService.getShowtimesByMovie(movieId);
        return ResponseEntity.ok(new ApiResponse<>(
                "Successfully retrieved showtimes for movie", showtimeResponse));
    }

    /**
     * Get all showtimes for a specific movie on a specific date
     * @param movieId ID of the movie
     * @param date Date for which to retrieve showtimes (format: yyyy-MM-dd)
     * @return API response with showtimes organized by branch for the specified date
     */
    @GetMapping("/{movieId}/by-date")
    public ResponseEntity<ApiResponse<?>> getShowtimesByMovieAndDate(
            @PathVariable Long movieId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Fetching showtimes for movie with ID: {} on date: {}", movieId, date);
        ShowtimeResponse showtimeResponse = showtimeService.getShowtimesByMovieAndDate(movieId, date);
        return ResponseEntity.ok(new ApiResponse<>(
                "Successfully retrieved showtimes for movie on specified date", showtimeResponse));
    }

    /**
     * Get all available dates for a specific movie that has showtimes
     * @param movieId ID of the movie
     * @return API response with list of available dates
     */
    @GetMapping("/{movieId}/available-dates")
    public ResponseEntity<ApiResponse<?>> getAvailableDatesByMovie(@PathVariable Long movieId) {
        log.info("Fetching available dates for movie with ID: {}", movieId);
        List<LocalDate> availableDates = showtimeService.getAvailableDatesByMovie(movieId);
        return ResponseEntity.ok(new ApiResponse<>(
                "Successfully retrieved available dates for movie", availableDates));
    }
}