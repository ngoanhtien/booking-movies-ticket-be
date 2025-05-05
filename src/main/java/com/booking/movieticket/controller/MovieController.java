package com.booking.movieticket.controller;

import com.booking.movieticket.dto.criteria.MovieCriteria;
import com.booking.movieticket.dto.request.admin.MovieRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.admin.MovieResponse;
import com.booking.movieticket.entity.Movie;
import com.booking.movieticket.service.MovieService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/movie")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
@CrossOrigin(origins = "*")
@Validated
public class MovieController {

    MovieService movieService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<Movie>>> getAllMovies(MovieCriteria movieCriteria,
                                                                 @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Movie fetched successfully.", movieService.getAllMovies(movieCriteria, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Movie>> getMovieById(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>("Movie details fetched successfully.", movieService.getMovieById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MovieResponse>> createMovie(@Valid @RequestBody MovieRequest movieRequest,
                                                                  @RequestParam(value = "smallImgUrl", required = false) MultipartFile smallImgUrl,
                                                                  @RequestParam(value = "largeImgUrl", required = false) MultipartFile largeImgUrl,
                                                                  BindingResult bindingResult) throws MethodArgumentNotValidException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("Movie created successfully.", movieService.createMovie(movieRequest, smallImgUrl, largeImgUrl, bindingResult)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<String>> updateMovie(@Valid @RequestBody MovieRequest movieRequest,
                                                           @RequestParam(value = "smallImgUrl", required = false) MultipartFile smallImgUrl,
                                                           @RequestParam(value = "largeImgUrl", required = false) MultipartFile largeImgUrl,
                                                           BindingResult bindingResult) throws MethodArgumentNotValidException {
        movieService.updateMovie(movieRequest, smallImgUrl, largeImgUrl, bindingResult);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("Cinema updated successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> activateMovie(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        movieService.activateMovie(id);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("Movie activated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateMovie(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        movieService.deactivateMovie(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Movie deactivated successfully."));
    }

    @GetMapping("/showing")
    public ResponseEntity<ApiResponse<?>> getShowingMovies() {
        List<Movie> movies = movieService.getShowingMovies();
        return ResponseEntity.ok(new ApiResponse<>("Successfully retrieved showing movies", movies));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<?>> getUpcomingMovies() {
        List<Movie> movies = movieService.getUpcomingMovies();
        return ResponseEntity.ok(new ApiResponse<>("Successfully retrieved upcoming movies", movies));
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ApiResponse<?>> getMovieDetail(@PathVariable Long id) {
        Movie movieInfo = movieService.findMovie(id);
        return ResponseEntity.ok(new ApiResponse<>("Get movie information successfully", movieInfo));
    }

}