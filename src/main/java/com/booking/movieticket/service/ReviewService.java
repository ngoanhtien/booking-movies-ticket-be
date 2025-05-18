package com.booking.movieticket.service;

import com.booking.movieticket.dto.request.ReviewRequest;
import com.booking.movieticket.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(Long userId, ReviewRequest reviewRequest);
    List<ReviewResponse> getReviewsByMovie(Long movieId);
    List<ReviewResponse> getReviewsByUser(Long userId);
    boolean canUserReviewMovie(Long userId, Long movieId);
}