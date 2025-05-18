package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Bill;
import com.booking.movieticket.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByBooking(Booking booking);
    List<Bill> findByUserIdOrderByCreatedAtDesc(Long userId);
}