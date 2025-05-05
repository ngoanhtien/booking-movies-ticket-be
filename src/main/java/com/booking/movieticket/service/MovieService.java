package com.booking.movieticket.service;

import com.booking.movieticket.dto.criteria.MovieCriteria;
import com.booking.movieticket.dto.request.admin.MovieRequest;
import com.booking.movieticket.dto.response.admin.MovieResponse;
import com.booking.movieticket.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MovieService {

    Movie getMovieById(Long id);

    Page<Movie> getAllMovies(MovieCriteria movieCriteria, Pageable pageable);

    MovieResponse createMovie(MovieRequest movieRequest, MultipartFile smallImgUrl, MultipartFile largeImgUrl, BindingResult bindingResult) throws MethodArgumentNotValidException;

    void updateMovie(MovieRequest movieRequest, MultipartFile smallImgUrl, MultipartFile largeImgUrl, BindingResult bindingResult) throws MethodArgumentNotValidException;

    void activateMovie(Long id);

    void deactivateMovie(Long id);

    List<Movie> getShowingMovies();

    List<Movie> getUpcomingMovies();

    Movie findMovie(Long id);
}