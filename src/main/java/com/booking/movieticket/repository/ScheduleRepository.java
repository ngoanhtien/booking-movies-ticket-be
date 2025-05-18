package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    /**
     * Find all available dates for a movie that has showtimes
     */
    @Query("SELECT DISTINCT s.date FROM Schedule s " +
            "JOIN s.showtimes st " +
            "WHERE s.movie.id = :movieId " +
            "AND s.date >= CURRENT_DATE " +
            "AND st.isDeleted = false " +
            "ORDER BY s.date")
    List<LocalDate> findAvailableDatesByMovieId(@Param("movieId") Long movieId);
}