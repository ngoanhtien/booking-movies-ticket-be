package com.booking.movieticket.service.impl;

import com.booking.movieticket.entity.Cinema;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.repository.CinemaRepository;
import com.booking.movieticket.service.CinemaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CinemaServiceImpl implements CinemaService {
    private final CinemaRepository cinemaRepository;

    @Override
    public Cinema findCinema(Long id) {
        return cinemaRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
    }
}
