package com.booking.movieticket.controller;

import com.booking.movieticket.dto.criteria.BranchCriteria;
import com.booking.movieticket.dto.request.admin.create.BranchForCreateRequest;
import com.booking.movieticket.dto.request.admin.update.BranchForUpdateRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.admin.BranchResponse;
import com.booking.movieticket.dto.response.admin.create.BranchCreatedResponse;
import com.booking.movieticket.service.BranchService;
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

@RestController
@RequestMapping("/branch")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
@CrossOrigin(origins = "*")
@Validated
public class BranchController {

    BranchService branchService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<BranchResponse>>> getAllBranch(BranchCriteria branchCriteria,
                                                                                    @PageableDefault(size = 20, sort = "cinemaId", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Branches fetched successfully.", branchService.getAllBranch(branchCriteria, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BranchResponse>> getBranchById(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Branch details fetched successfully.", branchService.getBranchById(id)));
    }

    @PostMapping("")
    public ResponseEntity<ApiResponse<BranchCreatedResponse>> createBranch(@Valid @RequestPart("branch") BranchForCreateRequest branchRequest,
                                                                           @RequestPart(value = "imageUrl", required = false) MultipartFile imageUrl,
                                                                           BindingResult bindingResult) throws MethodArgumentNotValidException {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>("Branch created successfully.", branchService.createBranch(branchRequest, imageUrl, bindingResult)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<String>> updateBranch(@Valid @RequestPart("branch") BranchForUpdateRequest branchRequest,
                                                            @RequestPart(value = "imageUrl", required = false) MultipartFile imageUrl,
                                                            BindingResult bindingResult) throws MethodArgumentNotValidException {
        branchService.updateBranch(branchRequest, imageUrl, bindingResult);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("Branch updated successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> activateBranch(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        branchService.activateBranch(id);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("Branch activated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateBranch(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        branchService.deactivateBranch(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Branch deactivated successfully."));
    }

}
