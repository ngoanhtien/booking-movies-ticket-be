package com.booking.movieticket.controller;

import com.booking.movieticket.dto.business.AccountDTO;
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
public class AccountController
{
    RoleService roleService;
    AccountService accountService;
    ImageUploadService imageUploadService;

    @PostMapping
    public ResponseEntity<?> saveUser(@ModelAttribute @Valid AccountRequest accountRequest,
            @RequestParam(value = "imageAvatar", required = false) MultipartFile imageAvata){
        AccountDTO accountDTO = new AccountDTO();
        try {
            if (accountRequest.getAvatarUrl() == null){
                accountRequest.setAvatarUrl(imageUploadService.uploadImage(imageAvata));
            }
            BeanUtils.copyProperties(accountRequest, accountDTO);

            Role role = roleService.findRoleById(accountRequest.getRoleId());
            accountDTO.setRole(role);
        } catch (IOException e) {
            return new ResponseEntity<>(new ApiResponse( HttpStatus.NOT_FOUND.value(), HttpStatus.NOT_FOUND.name(), e.getMessage()), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(new ApiResponse<>(HttpStatus.CREATED, accountService.saveUser(accountDTO), "Thêm phim thành công!"), HttpStatus.CREATED);
    }

}
