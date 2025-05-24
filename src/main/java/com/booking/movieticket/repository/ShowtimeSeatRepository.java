package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Showtime;
import com.booking.movieticket.entity.ShowtimeSeat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
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

    /**
     * Find all ShowtimeSeat entities by their IDs and lock them for update.
     * This is intended to be used during the booking process to prevent concurrent modifications.
     * @param ids List of ShowtimeSeat IDs to find and lock.
     * @return List of locked ShowtimeSeat entities.
     */
    @Query("SELECT ss FROM ShowtimeSeat ss WHERE ss.seat.id IN :ids" +
            " and  ss.showtime.schedule.id = :scheduleId " +
            "AND ss.seat.room.id = :roomId " )
    List<ShowtimeSeat> findAllByIdsForUpdate(@Param("ids") List<Long> ids,
                                              @Param("scheduleId") Long scheduleId,
                                              @Param("roomId") Long roomId);
}