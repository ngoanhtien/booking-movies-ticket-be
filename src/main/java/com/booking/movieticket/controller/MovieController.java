package com.booking.movieticket.controller;

import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.entity.Movie;
import com.booking.movieticket.service.MovieService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequestMapping("/movie")
public class MovieController {

    MovieService movieService;

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

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<?>> searchMovies(@RequestParam(required = false) String query) {
        if (query == null || query.trim().isEmpty()) {
            // If query is empty, return top 5 showing movies
            List<Movie> topMovies = movieService.getTopShowingMovies(5);
            return ResponseEntity.ok(new ApiResponse<>("Successfully retrieved top showing movies", topMovies));
        } else {
            // Otherwise search by query
            List<Movie> movies = movieService.searchMovies(query);
            return ResponseEntity.ok(new ApiResponse<>("Successfully searched movies", movies));
        }
    }

}