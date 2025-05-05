package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.criteria.CinemaCriteria;
import com.booking.movieticket.dto.request.admin.CinemaRequest;
import com.booking.movieticket.dto.response.admin.CinemaResponse;
import com.booking.movieticket.entity.Actor;
import com.booking.movieticket.entity.Cinema;
import com.booking.movieticket.entity.Movie;
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
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Objects;
import java.util.Optional;

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
        if (id == null) {
            throw new AppException(ErrorCode.CINEMA_NOT_FOUND);
        }
        return cinemaRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
    }

    @Override
    public Page<Cinema> getAllCinemas(CinemaCriteria cinemaCriteria, Pageable pageable) {
        return cinemaRepository.findAll(CinemaSpecificationBuilder.findByCriteria(cinemaCriteria), pageable);
    }

    @Override
    public CinemaResponse createCinema(CinemaRequest cinemaRequest, MultipartFile cinemaLogoUrl, BindingResult bindingResult) throws MethodArgumentNotValidException {
        validateImages(cinemaLogoUrl, bindingResult);
        if (bindingResult.hasErrors()) {
            throw new MethodArgumentNotValidException(null, bindingResult);
        }
        try {
            Cinema cinema = cinemaMapper.toCinema(cinemaRequest);
            processAndSetImages(cinema, cinemaLogoUrl);
            cinema.setIsDeleted(false);
            return cinemaMapper.toCinemaResponse(cinemaRepository.save(cinema));
        } catch (IOException e) {
            throw new AppException(ErrorCode.CINEMA_NOT_FOUND);
        }
    }

    @Override
    public void updateCinema(CinemaRequest cinemaRequest, MultipartFile cinemaLogoUrl, BindingResult bindingResult) throws MethodArgumentNotValidException {
        validateImages(cinemaLogoUrl, bindingResult);
        if (bindingResult.hasErrors()) {
            throw new MethodArgumentNotValidException(null, bindingResult);
        }
        try {
            if (cinemaRequest.getId() == null) {
                throw new AppException(ErrorCode.CINEMA_NOT_FOUND);
            }
            Cinema cinema = cinemaRepository.findById(cinemaRequest.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
            cinemaMapper.updateCinemaFromRequest(cinemaRequest, cinema);
            processAndSetImages(cinema, cinemaLogoUrl);
            cinemaRepository.save(cinema);
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }

    @Override
    public void activateCinema(Long id) {
        updateCinemaStatus(id, false);
    }

    @Override
    public void deactivateCinema(Long id) {
        updateCinemaStatus(id, true);
    }

    private void validateImages(MultipartFile cinemaLogoUrl, BindingResult bindingResult) {
        if (cinemaLogoUrl == null || cinemaLogoUrl.isEmpty()) {
            bindingResult.rejectValue("cinemaLogoUrl", "cinema.logoUrl.required", "Logo image is required");
        }
    }

    private void processAndSetImages(Cinema cinema, MultipartFile cinemaLogoUrl) throws IOException {
        if (cinemaLogoUrl != null && !cinemaLogoUrl.isEmpty()) {
            cinema.setLogoUrl(imageUploadService.uploadImage(cinemaLogoUrl));
        }
    }

    private void updateCinemaStatus(Long id, boolean isDeleted) {
        if (id == null) {
            throw new AppException(ErrorCode.CINEMA_NOT_FOUND);
        }
        Cinema cinema = cinemaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
        if (Objects.equals(cinema.getIsDeleted(), isDeleted)) {
            return;
        }
        cinema.setIsDeleted(isDeleted);
        cinemaRepository.save(cinema);
    }
}
