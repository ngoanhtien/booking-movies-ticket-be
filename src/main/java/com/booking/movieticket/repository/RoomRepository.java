package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long>, JpaSpecificationExecutor<Room> {
    @Query("SELECT r.name FROM Room r WHERE r.isDeleted = false AND r.branch.id = :branchId")
    List<String> findActiveRoomNames(@Param("branchId") Long branchId);
}
