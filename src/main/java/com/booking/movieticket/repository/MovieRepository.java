package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Movie;
import com.booking.movieticket.entity.enums.StatusMovie;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByStatus(StatusMovie status);

    @Query("SELECT m FROM Movie m WHERE m.status = 'SHOWING' AND LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY m.name")
    List<Movie> searchMoviesByName(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT m FROM Movie m WHERE m.status = 'SHOWING' ORDER BY SIZE(m.schedules) DESC")
    List<Movie> findTopShowingMovies(Pageable pageable);
}