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
import com.booking.movieticket.repository.BookingRepository;
import com.booking.movieticket.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional(readOnly = true)
    public boolean canUserReviewMovie(Long userId, Long movieId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            Movie movie = movieRepository.findById(movieId)
                    .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));

            // 1. Check if user already reviewed this movie
            if (reviewRepository.existsByUserAndMovie(user, movie)) {
                log.info("User {} already reviewed movie {}", userId, movieId);
                return false;
            }

            // 2. Check if user has a paid booking for a past showtime of this movie
            LocalDate currentDate = LocalDate.now();
            LocalTime currentTimeOfDay = LocalTime.now();
            boolean hasWatched = bookingRepository.existsPaidBookingForMoviePastShowtime(userId, movieId, currentDate, currentTimeOfDay);
            if (!hasWatched) {
                log.info("User {} is not eligible to review movie {} (no past paid booking found for date {} and time {})", userId, movieId, currentDate, currentTimeOfDay);
                return false;
            }

            return true;
        } catch (AppException e) {
            log.warn("Eligibility check failed for user {} and movie {}: {}", userId, movieId, e.getMessage());
            return false; // Or rethrow if appropriate for controller to handle specific errors
        } catch (Exception e) {
            log.error("Unexpected error during canUserReviewMovie for user {} and movie {}: {}", userId, movieId, e.getMessage(), e);
            return false; // Or rethrow
        }
    }

    @Override
    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest reviewRequest) {
        try {
            // Check eligibility
            if (!canUserReviewMovie(userId, reviewRequest.getMovieId())) {
                // Check again if already reviewed for a more specific error, as canUserReviewMovie logs it
                User tempUser = userRepository.findById(userId).orElse(null);
                Movie tempMovie = movieRepository.findById(reviewRequest.getMovieId()).orElse(null);
                if (tempUser != null && tempMovie != null && reviewRepository.existsByUserAndMovie(tempUser, tempMovie)) {
                    throw new AppException(ErrorCode.USER_ALREADY_REVIEWED_MOVIE);
                }
                throw new AppException(ErrorCode.USER_NOT_ELIGIBLE_TO_REVIEW);
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)); // Should not happen if canUserReviewMovie passed

            Movie movie = movieRepository.findById(reviewRequest.getMovieId())
                    .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND)); // Should not happen if canUserReviewMovie passed

            Review review = new Review();
            review.setNumberStar(reviewRequest.getRating());
            review.setComment(reviewRequest.getComment());
            review.setNumberLike(0);
            review.setUser(user);
            review.setMovie(movie);
            review.setIsDeleted(false); // Assuming BaseEntity handles createdAt/updatedAt

            Review savedReview = reviewRepository.save(review);
            return mapToReviewResponse(savedReview);
        } catch (AppException e) {
            log.error("Error creating review for user {}: {}", userId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating review for user {}: {}", userId, e.getMessage(), e);
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