package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.criteria.BranchCriteria;
import com.booking.movieticket.dto.request.admin.create.BranchForCreateRequest;
import com.booking.movieticket.dto.request.admin.update.BranchForUpdateRequest;
import com.booking.movieticket.dto.response.admin.BranchLocationDTO;
import com.booking.movieticket.dto.response.admin.BranchResponse;
import com.booking.movieticket.dto.response.admin.create.BranchCreatedResponse;
import com.booking.movieticket.entity.Branch;
import com.booking.movieticket.entity.Cinema;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.mapper.BranchMapper;
import com.booking.movieticket.repository.BranchRepository;
import com.booking.movieticket.repository.CinemaRepository;
import com.booking.movieticket.repository.specification.BranchSpecificationBuilder;
import com.booking.movieticket.service.BranchService;
import com.booking.movieticket.service.ImageUploadService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
public class BranchServiceImpl implements BranchService {

    BranchRepository branchRepository;
    CinemaRepository cinemaRepository;
    BranchMapper branchMapper;
    ImageUploadService imageUploadService;

    @Override
    public BranchResponse getBranchById(Long id) {
        if (id == null) {
            throw new AppException(ErrorCode.BRANCH_NOT_FOUND);
        }
        return branchMapper.convertEntityToBranchResponse(branchRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOT_FOUND)));
    }

    @Override
    public Page<BranchResponse> getAllBranchByCinemaId(BranchCriteria branchCriteria, Pageable pageable) {
        return branchRepository.findAll(BranchSpecificationBuilder.findByCriteria(branchCriteria), pageable).map(branchMapper::convertEntityToBranchResponse);
    }

    @Override
    @Transactional
    public BranchCreatedResponse createBranch(BranchForCreateRequest branchRequest, MultipartFile imageUrl, BindingResult bindingResult) throws MethodArgumentNotValidException {
        validateImages(imageUrl, bindingResult);
        if (bindingResult.hasErrors()) {
            throw new MethodArgumentNotValidException(null, bindingResult);
        }

        try {
            Branch branch = branchMapper.convertRequestToBranch(branchRequest);
            processAndSetImages(branch, imageUrl);
            branch.setIsDeleted(false);
            branch.setRating(0);
            branch.setRooms(null);
            return branchMapper.convertEntityToBranchCreatedResponse(branchRepository.save(branch));

        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }

    @Override
    @Transactional
    public void updateBranch(BranchForUpdateRequest branchRequest, MultipartFile imageUrl, BindingResult bindingResult) throws MethodArgumentNotValidException {
        validateImages(imageUrl, bindingResult);

        if (bindingResult.hasErrors()) {
            throw new MethodArgumentNotValidException(null, bindingResult);
        }

        try {
            if (branchRequest.getId() == null) {
                throw new AppException(ErrorCode.BRANCH_NOT_FOUND);
            }
            if (branchRepository.existsById(branchRequest.getId())) {
                throw new AppException(ErrorCode.BRANCH_NOT_FOUND);
            }
            if (cinemaRepository.existsById((branchRepository.findById(branchRequest.getId()).get().getCinema().getId()))) {
                throw new AppException(ErrorCode.CINEMA_NOT_FOUND);
            }
            Branch branch = branchRepository.findById(branchRequest.getId()).orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOT_FOUND));
            branchMapper.updateBranchFromRequest(branchRequest, branch);
            processAndSetImages(branch, imageUrl);
            branchRepository.save(branch);

        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }

    @Override
    public void activateBranch(Long id) {
        updateBranchStatus(id, false);
    }

    @Override
    public void deactivateBranch(Long id) {
        updateBranchStatus(id, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BranchLocationDTO> getBranches() {
        List<Branch> branches = branchRepository.findAll();
        return branchMapper.convertEntitiesToBranchLocationDTOs(branches);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BranchLocationDTO> getBranchesByCinemaId(Long cinemaId) {
        if (!cinemaRepository.existsById(cinemaId)) {
            throw new AppException(ErrorCode.CINEMA_NOT_FOUND);
        }
        Cinema cinema = cinemaRepository.findById(cinemaId).orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
        List<Branch> branches = branchRepository.findByCinema(cinema);
        return branchMapper.convertEntitiesToBranchLocationDTOs(branches);
    }

    private void validateImages(MultipartFile imageUrl, BindingResult bindingResult) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            bindingResult.rejectValue("imageUrl", "branch.imageUrl.required", "Branch image is required");
        }
    }

    private void processAndSetImages(Branch branch, MultipartFile imageUrl) throws IOException {
        if (imageUrl != null && !imageUrl.isEmpty()) {
            branch.setImageUrl(imageUploadService.uploadImage(imageUrl));
        }
    }

    private void updateBranchStatus(Long id, boolean isDeleted) {
        if (id == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Branch ID cannot be null");
        }

        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Branch not found"));

        if (Objects.equals(branch.getIsDeleted(), isDeleted)) {
            return;
        }

        branch.setIsDeleted(isDeleted);
        branchRepository.save(branch);
    }
}