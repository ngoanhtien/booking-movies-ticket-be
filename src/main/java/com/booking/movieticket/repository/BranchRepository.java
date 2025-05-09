package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Branch;
import com.booking.movieticket.entity.Cinema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface BranchRepository extends JpaRepository<Branch, Long>, JpaSpecificationExecutor<Branch> {
    boolean existsByCinema(Cinema cinema);

    List<Branch> findByCinema(Cinema cinema);
}
