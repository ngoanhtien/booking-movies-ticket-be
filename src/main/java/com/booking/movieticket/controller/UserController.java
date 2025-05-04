package com.booking.movieticket.controller;

import com.booking.movieticket.dto.request.ResetPasswordRequest;
import com.booking.movieticket.dto.request.UserRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.UserResponse;
import com.booking.movieticket.dto.vo.UserCriteria;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.mapper.UserMapper;
import com.booking.movieticket.service.MailSendService;
import com.booking.movieticket.service.UserService;
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
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
@CrossOrigin(origins = "*")
@Validated
public class UserController {

    UserService userService;

    MailSendService mailSendService;

    UserMapper userMapper;

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest userRequest,
                                                                @RequestParam(value = "avataUrl", required = false) MultipartFile imageAvatar) {
        return ResponseEntity.ok(new ApiResponse<>("Account created successfully.", userService.saveUser(userMapper.toUser(userRequest), imageAvatar)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<User>>> readUsers(UserCriteria userCriteria,
                                                             @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("User list fetched successfully.", userService.findUsers(userCriteria, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> readUser(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>("User details fetched successfully.", userService.findUser(id)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<String>> updateUser(@Valid @RequestBody UserRequest userRequest,
                                                          @RequestParam(value = "avataUrl", required = false) MultipartFile imageAvatar) {
        userService.updateUser(userMapper.toUser(userRequest), imageAvatar);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("User details fetched successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        userService.softDeleteUser(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Account status updated successfully."));
    }

    @PostMapping("/resetPassword")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        try {
            String mail = resetPasswordRequest.getEmail();
            User existedUser = userService.findUser(mail);
            String newPass = userService.resetPassword(existedUser);
            mailSendService.sendMail(mail, newPass);
            return ResponseEntity.ok(new ApiResponse<>(HttpStatus.OK.value(), "Reset password successful."));
        } catch (Exception e) {
            log.error("Unexpected error during authentication: {}.", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Unexpected error: " + e.getMessage()));
        }
    }

}
