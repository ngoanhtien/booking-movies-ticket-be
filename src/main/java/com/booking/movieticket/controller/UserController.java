package com.booking.movieticket.controller;

import com.booking.movieticket.dto.business.UserDTO;
import com.booking.movieticket.dto.dao.UserDAOCriteria;
import com.booking.movieticket.dto.request.UserRequest;
import com.booking.movieticket.dto.request.ResetPasswordRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.entity.Role;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.service.*;
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
public class UserController {

    RoleService roleService;

    UserService userService;

    ImageUploadService imageUploadService;

    MailSendService mailSendService;

    @PostMapping
    public ResponseEntity<?> createAccount(@ModelAttribute @Valid UserRequest userRequest,
                                           @RequestParam(value = "imageAvatar", required = false) MultipartFile imageAvatar) {
        UserDTO userDTO = new UserDTO();
        try {
            if (userRequest.getAvatarUrl() == null) {
                userRequest.setAvatarUrl(imageUploadService.uploadImage(imageAvatar));
            }
            BeanUtils.copyProperties(userRequest, userDTO);
            Role role = roleService.findRoleById(userRequest.getRoleId());
            userDTO.setRole(role);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>("Error: " + e.getMessage(), null));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>("Thêm tài khoản thành công!", userService.saveUser(userDTO)));
    }

    @GetMapping
    public ResponseEntity<?> readAccounts(UserDAOCriteria userDAOCriteria,
                                          @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Lấy danh sách tài khoản thành công!", userService.findUsers(userDAOCriteria, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> readAccount(@PathVariable @Valid Long id) {
        if (id == null || id < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Id không hợp lệ!", null));
        }
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>("Lấy danh sách tài khoản thành công!", userService.findUser(id)));
    }

    @PutMapping
    public ResponseEntity<?> updateAccount(@ModelAttribute @Valid UserRequest userRequest,
                                           @RequestParam(value = "avataUrl", required = false) MultipartFile imageAvatar) {
        UserDTO userDTO = new UserDTO();
        BeanUtils.copyProperties(userRequest, userDTO);
        Role role = roleService.findRoleById(userRequest.getRoleId());
        userDTO.setRole(role);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("Cập nhật tài khoản thành công!", userService.updateUser(userDTO, imageAvatar)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable @Valid Long id) {
        if (id == null || id < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Id không hợp lệ!", null));
        }

        try {
            userService.softDeleteUser(id);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(new ApiResponse<>("Cập nhật trạng thái tài khoản thành công!", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Error: " + e.getMessage(), null));
        }
    }

    @PostMapping("/resetPassword")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        try {
            String mail = resetPasswordRequest.getEmail();
            User existedUser = userService.findUserByEmail(mail);
            String newPass = userService.resetPassword(existedUser);
            mailSendService.sendMail(mail, newPass);
            return ResponseEntity.ok(new ApiResponse<>(HttpStatus.OK.value(), "Reset password successful"));
        } catch (Exception e) {
            log.error("Unexpected error during authentication: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Unexpected error: " + e.getMessage()));
        }
    }

}
