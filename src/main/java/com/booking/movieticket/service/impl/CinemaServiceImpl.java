package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.criteria.CinemaCriteria;
import com.booking.movieticket.dto.request.admin.create.CinemaForCreateRequest;
import com.booking.movieticket.dto.request.admin.update.CinemaForUpdateRequest;
import com.booking.movieticket.dto.response.admin.CinemaResponse;
import com.booking.movieticket.dto.response.admin.create.CinemaCreatedResponse;
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
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CinemaServiceImpl implements CinemaService {

    CinemaRepository cinemaRepository;
    CinemaMapper cinemaMapper;
    ImageUploadService imageUploadService;

    @Override
    public CinemaResponse getCinemaById(Long id) {
        if (id == null) {
            throw new AppException(ErrorCode.CINEMA_NOT_FOUND);
        }
        return cinemaMapper.convertCinemaToResponse(cinemaRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND)));
    }

    @Override
    public Page<CinemaResponse> getAllCinemas(CinemaCriteria cinemaCriteria, Pageable pageable) {
        return cinemaRepository.findAll(CinemaSpecificationBuilder.findByCriteria(cinemaCriteria), pageable).map(cinemaMapper::convertCinemaToResponse);
    }

    @Override
    public CinemaCreatedResponse createCinema(CinemaForCreateRequest cinemaRequest, MultipartFile logoUrl, BindingResult bindingResult) throws MethodArgumentNotValidException {
        validateImages(logoUrl, bindingResult);
        if (bindingResult.hasErrors()) {
            throw new MethodArgumentNotValidException(null, bindingResult);
        }
        try {
            Cinema cinema = cinemaMapper.convertRequestToCinema(cinemaRequest);
            processAndSetImages(cinema, logoUrl);
            cinema.setIsDeleted(false);
            return cinemaMapper.convertEntityToCinemaCreatedResponse(cinemaRepository.save(cinema));
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }

    @Override
    public void updateCinema(CinemaForUpdateRequest cinemaRequest, MultipartFile logoUrl, BindingResult bindingResult) throws MethodArgumentNotValidException {
        validateImages(logoUrl, bindingResult);
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
            processAndSetImages(cinema, logoUrl);
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

    @Override
    public List<String> getAllActiveCinemaName() {
        return cinemaRepository.findActiveCinemaNames();
    }

    private void validateImages(MultipartFile logoUrl, BindingResult bindingResult) {
        if (logoUrl == null || logoUrl.isEmpty()) {
            bindingResult.rejectValue("logoUrl", "cinema.logoUrl.required", "Logo image is required");
        }
    }

    private void processAndSetImages(Cinema cinema, MultipartFile logoUrl) throws IOException {
        if (logoUrl != null && !logoUrl.isEmpty()) {
            cinema.setLogoUrl(imageUploadService.uploadImage(logoUrl));
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
