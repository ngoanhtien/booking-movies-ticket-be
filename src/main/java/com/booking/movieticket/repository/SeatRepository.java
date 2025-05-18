package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    @Modifying
    @Query("DELETE FROM Seat s WHERE s.room.id = :roomId")
    Integer deleteAllByRoomId(@Param("roomId") Long roomId);
}
