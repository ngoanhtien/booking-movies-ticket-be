package com.booking.movieticket.service;

import com.booking.movieticket.dto.criteria.BranchCriteria;
import com.booking.movieticket.dto.request.admin.create.BranchForCreateRequest;
import com.booking.movieticket.dto.request.admin.update.BranchForUpdateRequest;
import com.booking.movieticket.dto.response.admin.BranchResponse;
import com.booking.movieticket.dto.response.admin.create.BranchCreatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BranchService {

    BranchResponse getBranchById(Long id);

    Page<BranchResponse> getAllBranchByCinemaId(BranchCriteria branchCriteria, Pageable pageable);

    BranchCreatedResponse createBranch(BranchForCreateRequest branchRequest, MultipartFile imageUrl, BindingResult bindingResult) throws MethodArgumentNotValidException;

    void updateBranch(BranchForUpdateRequest branchRequest, MultipartFile imageUrl, BindingResult bindingResult) throws MethodArgumentNotValidException;

    void activateBranch(Long id);

    void deactivateBranch(Long id);

    List<String> getAllActiveBranchByCinemaId(Long cinemaId);
}
