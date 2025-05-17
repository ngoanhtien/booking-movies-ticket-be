package com.booking.movieticket.service;

import com.booking.movieticket.dto.criteria.CinemaCriteria;
import com.booking.movieticket.dto.request.admin.update.CinemaForUpdateRequest;
import com.booking.movieticket.dto.request.admin.create.CinemaForCreateRequest;
import com.booking.movieticket.dto.response.admin.CinemaResponse;
import com.booking.movieticket.dto.response.admin.create.CinemaCreatedResponse;
import com.booking.movieticket.entity.Cinema;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CinemaService {

    CinemaResponse getCinemaById(Long id);

    Page<CinemaResponse> getAllCinemas(CinemaCriteria cinemaCriteria, Pageable pageable);

    CinemaCreatedResponse createCinema(CinemaForCreateRequest cinemaRequest, MultipartFile logoUrl, BindingResult bindingResult) throws MethodArgumentNotValidException;

    void updateCinema(CinemaForUpdateRequest cinemaRequest, MultipartFile logoUrl, BindingResult bindingResult) throws MethodArgumentNotValidException;

    void activateCinema(Long id);

    void deactivateCinema(Long id);

    List<String> getAllActiveCinemaName();
}
