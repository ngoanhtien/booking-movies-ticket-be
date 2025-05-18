package com.booking.movieticket.controller;

import com.booking.movieticket.dto.criteria.CinemaCriteria;
import com.booking.movieticket.dto.request.admin.create.CinemaForCreateRequest;
import com.booking.movieticket.dto.request.admin.update.CinemaForUpdateRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.admin.CinemaResponse;
import com.booking.movieticket.dto.response.admin.create.CinemaCreatedResponse;
import com.booking.movieticket.service.BranchService;
import com.booking.movieticket.service.CinemaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/cinema")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
@CrossOrigin(origins = "*")
@Validated
public class CinemaController {

    CinemaService cinemaService;
    BranchService branchService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<CinemaResponse>>> getAllCinemas(CinemaCriteria cinemaCriteria,
                                                                           @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Cinema fetched successfully.", cinemaService.getAllCinemas(cinemaCriteria, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaResponse>> getCinemaById(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>("Cinema details fetched successfully.", cinemaService.getCinemaById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CinemaCreatedResponse>> createCinema(@Valid @RequestPart("cinema") CinemaForCreateRequest cinemaRequest,
                                                                           @RequestPart(value = "logoUrl", required = false) MultipartFile logoUrl,
                                                                           BindingResult bindingResult) throws MethodArgumentNotValidException {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>("Cinema created successfully.", cinemaService.createCinema(cinemaRequest, logoUrl, bindingResult)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<String>> updateCinema(@Valid @RequestPart("cinema") CinemaForUpdateRequest cinemaRequest,
                                                            @RequestPart(value = "logoUrl", required = false) MultipartFile logoUrl,
                                                            BindingResult bindingResult) throws MethodArgumentNotValidException {
        cinemaService.updateCinema(cinemaRequest, logoUrl, bindingResult);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("Cinema updated successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> activateCinema(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        cinemaService.activateCinema(id);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("Cinema activated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateCinema(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        cinemaService.deactivateCinema(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Cinema deactivated successfully."));
    }

    @GetMapping("/name")
    public ResponseEntity<ApiResponse<List<String>>> getAllActiveCinemaName() {
        List<String> names = cinemaService.getAllActiveCinemaName();
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("List cinema name fetched successfully.", names));
    }
}
