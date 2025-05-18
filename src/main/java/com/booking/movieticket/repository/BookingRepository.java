package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.showtime s " +
           "JOIN FETCH s.schedule sched " +
           "JOIN FETCH sched.movie m " +
           "WHERE sched.date BETWEEN :startDate AND :endDate " +
           "AND b.status = 'CONFIRMED' " +
           "AND (:type IS NULL OR m.status = :type) " +
           "ORDER BY sched.date")
    List<Booking> findSalesReport(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("type") String type
    );

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN TRUE ELSE FALSE END " +
           "FROM Booking b " +
           "JOIN b.showtime st " +
           "JOIN st.schedule sch " +
           "JOIN sch.movie m " +
           "WHERE b.user.id = :userId " +
           "AND m.id = :movieId " +
           "AND (sch.date < :currentDate OR (sch.date = :currentDate AND sch.timeStart < :currentTimeOfDay)) " +
           "AND b.paymentStatus = 'PAID'")
    boolean existsPaidBookingForMoviePastShowtime(
        @Param("userId") Long userId,
        @Param("movieId") Long movieId,
        @Param("currentDate") LocalDate currentDate,
        @Param("currentTimeOfDay") LocalTime currentTimeOfDay
    );
    
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user u " +
           "JOIN FETCH b.showtime s " +
           "JOIN FETCH s.schedule sched " +
           "JOIN FETCH sched.movie m " +
           "JOIN FETCH s.room r " +
           "JOIN FETCH r.branch br " +
           "JOIN FETCH br.cinema c " +
           "LEFT JOIN FETCH b.showtimeSeats ss " +
           "WHERE b.user.id = :userId " +
           "ORDER BY b.bookingTime DESC")
    List<Booking> findByUserIdWithDetails(@Param("userId") Long userId);
} 