package com.booking.movieticket.controller;

import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.ShowtimeDetailResponse;
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
     * Get all showtimes for a specific movie on a specific date, optionally filtered by cinema
     * @param movieId ID of the movie
     * @param date Date for which to retrieve showtimes (format: yyyy-MM-dd)
     * @param cinemaId Optional ID of the cinema to filter by
     * @return API response with showtimes organized by branch for the specified criteria
     */
    @GetMapping("/{movieId}/filter")
    public ResponseEntity<ApiResponse<?>> getShowtimesByMovieAndDate(
            @PathVariable Long movieId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long cinemaId) {
        ShowtimeResponse showtimeResponse = showtimeService.getShowtimesByMovieAndDateAndCinema(movieId, date, cinemaId);

        return ResponseEntity.ok(new ApiResponse<>(
                "Successfully retrieved showtimes for movie based on specified criteria", showtimeResponse));
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

    /**
     * Get detailed information for a specific showtime, including seat layout
     * @param scheduleId ID of the schedule
     * @param roomId ID of the room
     * @return API response with detailed showtime information including seat layout
     */
    @GetMapping("/{scheduleId}/{roomId}/detail")
    public ResponseEntity<ApiResponse<?>> getShowtimeDetail(
            @PathVariable Long scheduleId,
            @PathVariable Long roomId) {
        log.info("Fetching detailed information for showtime with scheduleId: {} and roomId: {}", scheduleId, roomId);
        ShowtimeDetailResponse detailResponse = showtimeService.getShowtimeDetail(scheduleId, roomId);
        return ResponseEntity.ok(new ApiResponse<>(
                "Successfully retrieved showtime details", detailResponse));
    }
}