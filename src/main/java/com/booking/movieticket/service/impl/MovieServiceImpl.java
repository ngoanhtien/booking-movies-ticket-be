package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.response.MovieResponse;
import com.booking.movieticket.entity.Movie;
import com.booking.movieticket.entity.enums.StatusMovie;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.repository.MovieRepository;
import com.booking.movieticket.service.MovieService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;

    @Override
    public List<Movie> getShowingMovies() {
        try {
            return movieRepository.findByStatus(StatusMovie.SHOWING);
        } catch (Exception e) {
            log.error("Error fetching showing movies: {}", e.getMessage());
            throw new AppException(ErrorCode.USER_DUPLICATE);
        }
    }

    @Override
    public List<Movie> getUpcomingMovies() {
        try {
            return movieRepository.findByStatus(StatusMovie.UPCOMING);
        } catch (Exception e) {
            log.error("Error fetching upcoming movies: {}", e.getMessage());
            throw new AppException(ErrorCode.USER_DUPLICATE);
        }
    }

    @Override
    public Movie findMovie(@NotNull Long id) {
        return movieRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
    }

}