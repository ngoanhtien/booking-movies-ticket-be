package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findById(Long id);

    Optional<Role> findByName(String name);
}