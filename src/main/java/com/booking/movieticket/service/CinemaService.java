package com.booking.movieticket.service;

import com.booking.movieticket.dto.criteria.CinemaCriteria;
import com.booking.movieticket.dto.request.admin.CinemaRequest;
import com.booking.movieticket.dto.response.admin.CinemaResponse;
import com.booking.movieticket.entity.Cinema;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MultipartFile;

public interface CinemaService {

    Cinema getCinemaById(Long id);

    Page<Cinema> getAllCinemas(CinemaCriteria cinemaCriteria, Pageable pageable);

    CinemaResponse createCinema(CinemaRequest cinemaRequest, MultipartFile logoUrl, BindingResult bindingResult) throws MethodArgumentNotValidException;

    void updateCinema(CinemaRequest cinemaRequest, MultipartFile logoUrl, BindingResult bindingResult) throws MethodArgumentNotValidException;

    void activateCinema(Long id);

    void deactivateCinema(Long id);
}
