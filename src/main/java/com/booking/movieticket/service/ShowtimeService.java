package com.booking.movieticket.service;

import com.booking.movieticket.dto.response.ShowtimeResponse;

import java.time.LocalDate;
import java.util.List;

public interface ShowtimeService {
    /**
     * Get all showtimes for a specific movie organized by branches
     * @param movieId ID of the movie
     * @return ShowtimeResponse containing movie info and showtimes by branch
     */
    ShowtimeResponse getShowtimesByMovie(Long movieId);

    /**
     * Get all showtimes for a specific movie on a specific date organized by branches
     * @param movieId ID of the movie
     * @param date Date for which to retrieve showtimes
     * @return ShowtimeResponse containing movie info and showtimes by branch for the specified date
     */
    ShowtimeResponse getShowtimesByMovieAndDate(Long movieId, LocalDate date);

    /**
     * Get all available dates for a specific movie that has showtimes
     * @param movieId ID of the movie
     * @return List of available dates
     */
    List<LocalDate> getAvailableDatesByMovie(Long movieId);
}