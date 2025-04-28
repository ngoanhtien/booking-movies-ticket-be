package com.booking.movieticket.service;

import com.booking.movieticket.entity.Cinema;

import java.util.List;

public interface CinemaService {
    Cinema findCinema(Long id);

    List<Cinema> findAllCinema();
}
