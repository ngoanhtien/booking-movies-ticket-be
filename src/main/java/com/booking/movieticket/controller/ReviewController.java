package com.booking.movieticket.controller;

import com.booking.movieticket.dto.request.ReviewRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.ReviewResponse;
import com.booking.movieticket.security.jwt.DomainUserDetails;
import com.booking.movieticket.service.ReviewService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequestMapping("/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    ReviewService reviewService;

    /**
     * Create a new review for a movie
     * @param userDetails Authenticated user details
     * @param reviewRequest Review information
     * @return Created review
     */
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createReview(
            @AuthenticationPrincipal DomainUserDetails userDetails,
            @Valid @RequestBody ReviewRequest reviewRequest) {
        log.info("Creating review for movie: {} by user: {}", reviewRequest.getMovieId(), userDetails.getUserId());
        ReviewResponse reviewResponse = reviewService.createReview(userDetails.getUserId(), reviewRequest);
        return ResponseEntity.ok(new ApiResponse<>("Review created successfully", reviewResponse));
    }

    /**
     * Get all reviews for a specific movie
     * @param movieId ID of the movie
     * @return List of reviews for the movie
     */
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ApiResponse<?>> getReviewsByMovie(@PathVariable Long movieId) {
        log.info("Getting reviews for movie: {}", movieId);
        List<ReviewResponse> reviews = reviewService.getReviewsByMovie(movieId);
        return ResponseEntity.ok(new ApiResponse<>("Movie reviews retrieved successfully", reviews));
    }

    /**
     * Get all reviews by a specific user
     * @param userId ID of the user
     * @return List of reviews by the user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<?>> getReviewsByUser(@PathVariable Long userId) {
        log.info("Getting reviews by user: {}", userId);
        List<ReviewResponse> reviews = reviewService.getReviewsByUser(userId);
        return ResponseEntity.ok(new ApiResponse<>("User reviews retrieved successfully", reviews));
    }
}