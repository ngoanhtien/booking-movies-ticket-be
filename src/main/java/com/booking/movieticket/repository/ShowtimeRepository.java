package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Showtime;
import com.booking.movieticket.entity.compositekey.ShowtimeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, ShowtimeId> {

    /**
     * Find all showtimes for a specific movie, ordered by branch, date, and time
     * Only returns active (not deleted and enabled) showtimes
     */
    @Query("SELECT st FROM Showtime st " +
            "JOIN st.schedule s " +
            "JOIN st.room r " +
            "JOIN r.branch b " +
            "WHERE s.movie.id = :movieId " +
            "AND st.isDeleted = false " +
            "AND (s.date >= CURRENT_DATE) " +
            "ORDER BY b.id, s.date, s.timeStart")
    List<Showtime> findByMovieIdOrderByBranchAndSchedule(@Param("movieId") Long movieId);

    /**
     * Find showtimes for a specific movie on a specific date, ordered by branch and time
     */
    @Query("SELECT st FROM Showtime st " +
            "JOIN st.schedule s " +
            "JOIN st.room r " +
            "JOIN r.branch b " +
            "WHERE s.movie.id = :movieId " +
            "AND s.date = :date " +
            "AND st.isDeleted = false " +
            "ORDER BY b.id, s.timeStart")
    List<Showtime> findByMovieIdAndDateOrderByBranchAndTime(
            @Param("movieId") Long movieId,
            @Param("date") LocalDate date);
}