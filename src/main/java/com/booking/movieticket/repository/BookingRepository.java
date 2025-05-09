package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
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
} 