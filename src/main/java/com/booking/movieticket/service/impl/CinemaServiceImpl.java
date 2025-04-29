package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.criteria.CinemaCriteria;
import com.booking.movieticket.dto.request.admin.CinemaRequest;
import com.booking.movieticket.dto.response.CinemaResponse;
import com.booking.movieticket.entity.Cinema;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.mapper.CinemaMapper;
import com.booking.movieticket.repository.CinemaRepository;
import com.booking.movieticket.repository.specification.CinemaSpecificationBuilder;
import com.booking.movieticket.service.CinemaService;
import com.booking.movieticket.service.ImageUploadService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CinemaServiceImpl implements CinemaService {
    CinemaRepository cinemaRepository;
    CinemaMapper cinemaMapper;
    ImageUploadService imageUploadService;

    @Override
    public Cinema getCinemaById(Long id) {
        return cinemaRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
    }

    @Override
    public Page<Cinema> getAllCinema(CinemaCriteria cinemaCriteria, Pageable pageable) {
        return cinemaRepository.findAll(CinemaSpecificationBuilder.findByCriteria(cinemaCriteria), pageable);
    }

    @Override
    public CinemaResponse createCinema(CinemaRequest cinemaRequest, MultipartFile cinemaLogoUrl) {
        Cinema cinema = cinemaMapper.toCinema(cinemaRequest);
        try {
            if (cinema.getLogoUrl() == null) {
                cinema.setLogoUrl(imageUploadService.uploadImage(cinemaLogoUrl));
            }
        } catch (IOException e) {
            throw new AppException(ErrorCode.CINEMA_LOGO_NOT_FOUND);
        }
        cinema.setIsDeleted(false);
        return cinemaMapper.toCinemaResponse(cinemaRepository.save(cinema));
    }

    @Override
    public void updateCinema(CinemaRequest cinemaRequest, MultipartFile cinemaLogoUrl) {
        Cinema cinemaForUpdate = cinemaMapper.toCinema(cinemaRequest);
        if (cinemaForUpdate.getId() == null) {
            throw new AppException(ErrorCode.CINEMA_ID_NOT_FOUND);
        }
        Cinema cinema = cinemaRepository.findById(cinemaForUpdate.getId()).orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
        try {
            if (cinemaForUpdate.getLogoUrl() != null) {
                cinema.setLogoUrl(imageUploadService.uploadImage(cinemaLogoUrl));
            } else {

            }
        } catch (IOException e) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        cinemaRepository.save(cinema);
    }

    @Override
    public void activateCinema(Long id) {
        Cinema cinema = cinemaRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
        cinema.setIsDeleted(false);
        cinemaRepository.save(cinema);
    }

    @Override
    public void deactivateCinema(Long id) {
        Cinema cinema = cinemaRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
        cinema.setIsDeleted(false);
        cinemaRepository.save(cinema);
    }

}
