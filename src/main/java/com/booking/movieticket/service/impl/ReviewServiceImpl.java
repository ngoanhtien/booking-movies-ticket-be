package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.request.ReviewRequest;
import com.booking.movieticket.dto.response.ReviewResponse;
import com.booking.movieticket.entity.Movie;
import com.booking.movieticket.entity.Review;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.repository.MovieRepository;
import com.booking.movieticket.repository.ReviewRepository;
import com.booking.movieticket.repository.UserRepository;
import com.booking.movieticket.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    @Override
    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest reviewRequest) {
        try {
            // Get user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            // Get movie
            Movie movie = movieRepository.findById(reviewRequest.getMovieId())
                    .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));

            // Create and save review
            Review review = new Review();
            review.setNumberStar(reviewRequest.getRating());
            review.setComment(reviewRequest.getComment());
            review.setNumberLike(0); // Initialize likes to zero
            review.setUser(user);
            review.setMovie(movie);
            review.setIsDeleted(false);

            Review savedReview = reviewRepository.save(review);

            // Return response
            return mapToReviewResponse(savedReview);
        } catch (AppException e) {
            log.error("Error creating review: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating review: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Error creating review");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByMovie(Long movieId) {
        try {
            // Verify movie exists
            if (!movieRepository.existsById(movieId)) {
                throw new AppException(ErrorCode.MOVIE_NOT_FOUND);
            }

            List<Review> reviews = reviewRepository.findByMovieId(movieId);
            return reviews.stream()
                    .map(this::mapToReviewResponse)
                    .collect(Collectors.toList());
        } catch (AppException e) {
            log.error("Error getting reviews for movie: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error getting reviews for movie: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Error getting movie reviews");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByUser(Long userId) {
        try {
            // Verify user exists
            if (!userRepository.existsById(userId)) {
                throw new AppException(ErrorCode.USER_NOT_FOUND);
            }

            List<Review> reviews = reviewRepository.findByUserId(userId);
            return reviews.stream()
                    .map(this::mapToReviewResponse)
                    .collect(Collectors.toList());
        } catch (AppException e) {
            log.error("Error getting reviews by user: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error getting reviews by user: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Error getting user reviews");
        }
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .movieId(review.getMovie().getId())
                .movieName(review.getMovie().getName())
                .userId(review.getUser().getId())
                .username(review.getUser().getUsername())
                .rating(review.getNumberStar())
                .likes(review.getNumberLike())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}