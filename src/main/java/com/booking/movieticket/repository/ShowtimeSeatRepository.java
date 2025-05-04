package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Showtime;
import com.booking.movieticket.entity.ShowtimeSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowtimeSeatRepository extends JpaRepository<ShowtimeSeat, Long> {

    /**
     * Find all seats for a specific showtime
     */
    List<ShowtimeSeat> findByShowtime(Showtime showtime);

    /**
     * Find all seats for a specific showtime using scheduleId and roomId
     */
    @Query("SELECT ss FROM ShowtimeSeat ss WHERE ss.showtime.id.scheduleId = :scheduleId AND ss.showtime.id.roomId = :roomId")
    List<ShowtimeSeat> findByShowtimeId(@Param("scheduleId") Long scheduleId, @Param("roomId") Long roomId);
}