package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Branch;
import com.booking.movieticket.entity.Cinema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BranchRepository extends JpaRepository<Branch, Long>, JpaSpecificationExecutor<Branch> {
    boolean existsByCinema(Cinema cinema);

    @Query("SELECT b.name FROM Branch b WHERE b.isDeleted = false AND b.cinema.id = :cinemaId")
    List<String> findActiveBranchNames(@Param("cinemaId") Long cinemaId);
}
