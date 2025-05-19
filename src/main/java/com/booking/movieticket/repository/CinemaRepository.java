package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Cinema;
import com.booking.movieticket.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CinemaRepository extends JpaRepository<Cinema, Long>, JpaSpecificationExecutor<Cinema> {
    Optional<Cinema> findById(long id);

    @Query("SELECT c.name FROM Cinema c WHERE c.isDeleted = false")
    List<String> findActiveCinemaNames();
}
