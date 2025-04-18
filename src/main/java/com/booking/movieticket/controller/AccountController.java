package com.booking.movieticket.controller;

import com.booking.movieticket.dto.business.AccountDTO;
import com.booking.movieticket.dto.filter.AccountFilterCriteria;
import com.booking.movieticket.dto.request.AccountRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.entity.Role;
import com.booking.movieticket.service.AccountService;
import com.booking.movieticket.service.ImageUploadService;
import com.booking.movieticket.service.RoleService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
@CrossOrigin(origins = "*")
@Validated
public class AccountController {

    RoleService roleService;

    AccountService accountService;

    ImageUploadService imageUploadService;

    @PostMapping
    public ResponseEntity<?> createAccount(@ModelAttribute @Valid AccountRequest accountRequest,
                                           @RequestParam(value = "imageAvatar", required = false) MultipartFile imageAvatar) {
        AccountDTO accountDTO = new AccountDTO();
        try {
            if (accountRequest.getAvatarUrl() == null) {
                accountRequest.setAvatarUrl(imageUploadService.uploadImage(imageAvatar));
            }
            BeanUtils.copyProperties(accountRequest, accountDTO);
            Role role = roleService.findRoleById(accountRequest.getRoleId());
            accountDTO.setRole(role);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>("Error: " + e.getMessage(), null));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>("Thêm tài khoản thành công!", accountService.saveUser(accountDTO)));
    }

    @GetMapping
    public ResponseEntity<?> readAccounts(AccountFilterCriteria accountFilterCriteria,
                                          @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Lấy danh sách tài khoản thành công!", accountService.findUsers(accountFilterCriteria, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> readAccount(@PathVariable @Valid Long id) {
        if (id == null || id < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Id không hợp lệ!", null));
        }
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>("Lấy danh sách tài khoản thành công!", accountService.findUser(id)));
    }

    @PutMapping
    public ResponseEntity<?> updateAccount(@ModelAttribute @Valid AccountRequest accountRequest,
                                           @RequestParam(value = "avataUrl", required = false) MultipartFile imageAvatar) {
        AccountDTO accountDTO = new AccountDTO();
        BeanUtils.copyProperties(accountRequest, accountDTO);
        Role role = roleService.findRoleById(accountRequest.getRoleId());
        accountDTO.setRole(role);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("Cập nhật tài khoản thành công!", accountService.updateUser(accountDTO, imageAvatar)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable @Valid Long id) {
        if (id == null || id < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Id không hợp lệ!", null));
        }

        try {
            accountService.toggleAccountStatus(id);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(new ApiResponse<>("Cập nhật trạng thái tài khoản thành công!", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Error: " + e.getMessage(), null));
        }
    }

}
