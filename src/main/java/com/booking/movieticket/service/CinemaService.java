package com.booking.movieticket.service;

import com.booking.movieticket.dto.criteria.CinemaCriteria;
import com.booking.movieticket.dto.request.admin.CinemaRequest;
import com.booking.movieticket.dto.response.CinemaResponse;
import com.booking.movieticket.entity.Cinema;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface CinemaService {

    Cinema getCinemaById(Long id);

    Page<Cinema> getAllCinema(CinemaCriteria cinemaCriteria, Pageable pageable);

    CinemaResponse createCinema(CinemaRequest cinemaRequest, MultipartFile cinemaLogoUrl);

    void updateCinema(CinemaRequest cinemaRequest, MultipartFile cinemaLogoUrl);

    void activateCinema(Long id);

    void deactivateCinema(Long id);
}
