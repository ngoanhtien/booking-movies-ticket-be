package com.booking.movieticket.service;

import com.booking.movieticket.entity.Movie;

import java.util.List;

public interface MovieService {
    List<Movie> getShowingMovies();

    List<Movie> getUpcomingMovies();

    Movie findMovie(Long id);

    List<Movie> searchMovies(String searchTerm);

    List<Movie> getTopShowingMovies(int limit);
}