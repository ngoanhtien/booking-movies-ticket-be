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
     * Find showtimes for a specific movie on a specific date, ordered by branch and time
     * This query uses JOIN FETCH to eagerly load related entities to prevent N+1 issues.
     */
    @Query("SELECT st FROM Showtime st " +
           "JOIN FETCH st.schedule s " +
           "JOIN FETCH s.movie m " + // Eagerly fetch the movie associated with the schedule
           "JOIN FETCH st.room r " +
           "JOIN FETCH r.branch b " + // Eagerly fetch the branch associated with the room
           "LEFT JOIN FETCH b.cinema c " + // Optionally fetch cinema if needed for details like hotline/image
           "WHERE m.id = :movieId " +
           "AND s.date = :date " +
           "AND st.isDeleted = false " +
           "ORDER BY b.id, s.timeStart") // Keep original ordering
    List<Showtime> findByMovieIdAndDateOrderByBranchAndTime(
            @Param("movieId") Long movieId,
            @Param("date") LocalDate date);

    /**
     * Find showtimes for a specific movie on a specific date, optionally filtered by cinema, ordered by branch and time
     * Updated to use JOIN FETCH for better performance and to avoid N+1 issues.
     */
    @Query("SELECT st FROM Showtime st " +
            "JOIN FETCH st.schedule s " +
            "JOIN FETCH s.movie m " +
            "JOIN FETCH st.room r " +
            "JOIN FETCH r.branch b " +
            "LEFT JOIN FETCH b.cinema c " +
            "WHERE m.id = :movieId " +
            "AND s.date = :date " +
            "AND st.isDeleted = false " +
            "AND (:cinemaId IS NULL OR b.cinema.id = :cinemaId) " +
            "ORDER BY b.id, s.timeStart")
    List<Showtime> findByMovieIdAndDateAndCinemaIdOrderByBranchAndTime(
            @Param("movieId") Long movieId,
            @Param("date") LocalDate date,
            @Param("cinemaId") Long cinemaId);

    /**
     * Find showtimes for attendance report within a date range
     */
    @Query("SELECT st FROM Showtime st " +
            "JOIN st.schedule s " +
            "JOIN st.room r " +
            "WHERE s.date BETWEEN :startDate AND :endDate " +
            "AND st.isDeleted = false " +
            "AND (:type IS NULL OR s.movie.status = :type) " +
            "ORDER BY s.date, s.movie.name")
    List<Showtime> findAttendanceReport(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("type") String type);
}