package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Review;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMovieId(Long movieId);
    List<Review> findByUserId(Long userId);
    boolean existsByUserAndMovie(User user, Movie movie);
}