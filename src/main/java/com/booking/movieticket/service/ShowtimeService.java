package com.booking.movieticket.service;

import com.booking.movieticket.dto.response.ShowtimeDetailResponse;
import com.booking.movieticket.dto.response.ShowtimeResponse;

import java.time.LocalDate;
import java.util.List;

public interface ShowtimeService {

    /**
     * Get all showtimes for a specific movie on a specific date organized by branches
     * @param movieId ID of the movie
     * @param date Date for which to retrieve showtimes
     * @return ShowtimeResponse containing movie info and showtimes by branch for the specified date
     */
    ShowtimeResponse getShowtimesByMovieAndDate(Long movieId, LocalDate date);

    /**
     * Get all showtimes for a specific movie on a specific date, optionally filtered by cinema, organized by branches
     * @param movieId ID of the movie
     * @param date Date for which to retrieve showtimes
     * @param cinemaId Optional ID of cinema to filter by
     * @return ShowtimeResponse containing movie info and showtimes by branch for the specified criteria
     */
    ShowtimeResponse getShowtimesByMovieAndDateAndCinema(Long movieId, LocalDate date, Long cinemaId);

    /**
     * Get all available dates for a specific movie that has showtimes
     * @param movieId ID of the movie
     * @return List of available dates
     */
    List<LocalDate> getAvailableDatesByMovie(Long movieId);

    /**
     * Get detailed information for a specific showtime, including all seats
     * @param scheduleId ID of the schedule
     * @param roomId ID of the room
     * @return Detailed showtime information including seats
     */
    ShowtimeDetailResponse getShowtimeDetail(Long scheduleId, Long roomId);
}