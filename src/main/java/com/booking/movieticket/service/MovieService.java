package com.booking.movieticket.service;

import com.booking.movieticket.dto.criteria.MovieCriteria;
import com.booking.movieticket.dto.request.admin.MovieTungRequest;
import com.booking.movieticket.dto.response.MovieResponse;
import com.booking.movieticket.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MovieService {

    Movie getMovieById(Long id);

    Page<Movie> getAllMovie(MovieCriteria movieCriteria, Pageable pageable);

    MovieResponse createMovie(MovieTungRequest movieRequest, MultipartFile movieSmallImgUrl, MultipartFile movieLargeImgUrl);

    void updateMovie(MovieTungRequest movieRequest, MultipartFile movieSmallImgUrl, MultipartFile movieLargeImgUrl);

    void activateMovie(Long id);

    void deactivateMovie(Long id);

    List<Movie> getShowingMovies();

    List<Movie> getUpcomingMovies();

    Movie findMovie(Long id);
}