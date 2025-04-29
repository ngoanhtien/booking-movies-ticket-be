package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.criteria.MovieCriteria;
import com.booking.movieticket.dto.request.admin.MovieTungRequest;
import com.booking.movieticket.dto.response.MovieResponse;
import com.booking.movieticket.entity.Movie;
import com.booking.movieticket.entity.enums.StatusMovie;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.mapper.MovieMapper;
import com.booking.movieticket.repository.MovieRepository;
import com.booking.movieticket.repository.specification.MovieSpecificationBuilder;
import com.booking.movieticket.service.ImageUploadService;
import com.booking.movieticket.service.MovieService;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MovieServiceImpl implements MovieService {

    MovieRepository movieRepository;
    MovieMapper movieMapper;
    ImageUploadService imageUploadService;

    @Override
    public Movie getMovieById(Long id) {
        return movieRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
    }

    @Override
    public Page<Movie> getAllMovie(MovieCriteria movieCriteria, Pageable pageable) {
        return movieRepository.findAll(MovieSpecificationBuilder.findByCriteria(movieCriteria), pageable);
    }

    @Override
    public MovieResponse createMovie(MovieTungRequest movieRequest, MultipartFile movieSmallImgUrl, MultipartFile movieLargeImgUrl) {
        Movie movie = movieMapper.toMovie(movieRequest);
        try {
            if (movie.getImageSmallUrl() == null && movie.getImageLargeUrl() == null) {
                movie.setImageLargeUrl(imageUploadService.uploadImage(movieLargeImgUrl));
                movie.setImageSmallUrl(imageUploadService.uploadImage(movieSmallImgUrl));
            }
        } catch (IOException e) {
            throw new AppException(ErrorCode.MOVIE_LOGO_NOT_FOUND);
        }
        movie.setIsDeleted(false);
        return movieMapper.toMovieResponse(movieRepository.save(movie));
    }

    @Override
    public void updateMovie(MovieTungRequest movieRequest, MultipartFile movieSmallImgUrl, MultipartFile movieLargeImgUrl) {
        Movie movieForUpdate = movieMapper.toMovie(movieRequest);
        if (movieForUpdate.getId() == null) {
            throw new AppException(ErrorCode.MOVIE_NOT_FOUND);
        }
        Movie movie = movieRepository.findById(movieForUpdate.getId()).orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
        try {
            if (movieForUpdate.getImageSmallUrl() != null && movieForUpdate.getImageLargeUrl() != null) {
                movie.setImageSmallUrl(imageUploadService.uploadImage(movieSmallImgUrl));
                movie.setImageLargeUrl(imageUploadService.uploadImage(movieLargeImgUrl));
            } else {

            }
        } catch (IOException e) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        movieRepository.save(movie);
    }

    @Override
    public void activateMovie(Long id) {
        Movie movie = movieRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
        movie.setIsDeleted(false);
        movieRepository.save(movie);
    }

    @Override
    public void deactivateMovie(Long id) {
        Movie movie = movieRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
        movie.setIsDeleted(true);
        movieRepository.save(movie);
    }

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