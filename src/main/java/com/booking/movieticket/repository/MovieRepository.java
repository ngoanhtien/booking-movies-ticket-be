package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Movie;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.entity.enums.StatusMovie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long>, JpaSpecificationExecutor<Movie> {
    List<Movie> findByStatus(StatusMovie status);

    Optional<Movie> findById(long id);
}