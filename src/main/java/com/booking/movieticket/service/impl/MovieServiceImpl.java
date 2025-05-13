package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.criteria.MovieCriteria;
import com.booking.movieticket.dto.request.admin.update.MovieForUpdateRequest;
import com.booking.movieticket.dto.request.admin.create.MovieForCreateRequest;
import com.booking.movieticket.dto.response.admin.MovieResponse;
import com.booking.movieticket.dto.response.admin.create.MovieCreatedResponse;
import com.booking.movieticket.entity.Movie;
import com.booking.movieticket.entity.enums.StatusMovie;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.mapper.MovieMapper;
import com.booking.movieticket.repository.ActorRepository;
import com.booking.movieticket.repository.CategoryRepository;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MovieServiceImpl implements MovieService {

    MovieRepository movieRepository;
    ActorRepository actorRepository;
    CategoryRepository categoryRepository;
    MovieMapper movieMapper;
    ImageUploadService imageUploadService;

    @Override
    public MovieResponse getMovieById(Long id) {
        if (id == null) {
            throw new AppException(ErrorCode.MOVIE_NOT_FOUND);
        }
        return movieMapper.convertEntityToMovieResponse(movieRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND)));
    }

    @Override
    public Page<MovieResponse> getAllMovies(MovieCriteria movieCriteria, Pageable pageable) {
        return movieRepository.findAll(MovieSpecificationBuilder.findByCriteria(movieCriteria), pageable).map(movieMapper::convertEntityToMovieResponse);
    }

    @Override
    public MovieCreatedResponse createMovie(MovieForCreateRequest movieRequest, MultipartFile smallImgUrl, MultipartFile largeImgUrl, BindingResult bindingResult) throws MethodArgumentNotValidException {
        validateImages(smallImgUrl, largeImgUrl, bindingResult);
        if (bindingResult.hasErrors()) {
            throw new MethodArgumentNotValidException(null, bindingResult);
        }
        try {
            Movie movie = movieMapper.convertRequestToMovie(movieRequest);
            movieMapper.mapRelations(movie, movieRequest, categoryRepository, actorRepository);
            processAndSetImages(movie, smallImgUrl, largeImgUrl);
            movie.setIsDeleted(false);
            return movieMapper.convertEntityToMovieCreatedResponse(movieRepository.save(movie));
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }

    @Override
    @Transactional
    public void updateMovie(MovieForUpdateRequest movieRequest, MultipartFile smallImgUrl, MultipartFile largeImgUrl, BindingResult bindingResult) throws MethodArgumentNotValidException {
        validateImages(smallImgUrl, largeImgUrl, bindingResult);
        if (bindingResult.hasErrors()) {
            throw new MethodArgumentNotValidException(null, bindingResult);
        }
        try {
            if (movieRequest.getId() == null) {
                throw new AppException(ErrorCode.MOVIE_NOT_FOUND);
            }
            Movie movie = movieRepository.findById(movieRequest.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
            movieMapper.mapRelations(movie, movieRequest, categoryRepository, actorRepository);
            processAndSetImages(movie, smallImgUrl, largeImgUrl);
            movieRepository.save(movie);
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }

    @Override
    public void activateMovie(Long id) {
        updateMovieStatus(id, false);
    }

    @Override
    public void deactivateMovie(Long id) {
        updateMovieStatus(id, true);
    }

    @Override
    public List<Movie> getShowingMovies() {
        try {
            return movieRepository.findByStatus(StatusMovie.SHOWING);
        } catch (Exception e) {
            log.error("Error fetching showing movies: {}", e.getMessage());
            throw new AppException(ErrorCode.SHOWING_MOVIE_NOT_FOUND);
        }
    }

    @Override
    public List<Movie> getUpcomingMovies() {
        try {
            return movieRepository.findByStatus(StatusMovie.UPCOMING);
        } catch (Exception e) {
            log.error("Error fetching upcoming movies: {}", e.getMessage());
            throw new AppException(ErrorCode.UPCOMING_MOVIE_NOT_FOUND);
        }
    }

    @Override
    public Movie findMovie(@NotNull Long id) {
        return movieRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
    }

    @Override
    public Movie saveMovie(Movie movie) {
        if (movie == null) {
            throw new AppException(ErrorCode.MOVIE_NOT_FOUND);
        }
        return movieRepository.save(movie);
    }

    private void validateImages(MultipartFile smallImgUrl, MultipartFile largeImgUrl, BindingResult bindingResult) {
        if (smallImgUrl == null || smallImgUrl.isEmpty()) {
            bindingResult.rejectValue("smallImgUrl", "movie.smallImage.required", "Small image is required");
        }

        if (largeImgUrl == null || largeImgUrl.isEmpty()) {
            bindingResult.rejectValue("largeImgUrl", "movie.largeImage.required", "Large image is required");
        }
    }

    private void processAndSetImages(Movie movie, MultipartFile smallImgUrl, MultipartFile largeImgUrl) throws IOException {
        if (smallImgUrl != null && !smallImgUrl.isEmpty()) {
            movie.setImageSmallUrl(imageUploadService.uploadImage(smallImgUrl));
        }

        if (largeImgUrl != null && !largeImgUrl.isEmpty()) {
            movie.setImageLargeUrl(imageUploadService.uploadImage(largeImgUrl));
        }
    }

    private void updateMovieStatus(Long id, boolean isDeleted) {
        if (id == null) {
            throw new AppException(ErrorCode.MOVIE_NOT_FOUND);
        }
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
        if (Objects.equals(movie.getIsDeleted(), isDeleted)) {
            return;
        }
        movie.setIsDeleted(isDeleted);
        movieRepository.save(movie);
    }
}