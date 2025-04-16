package com.booking.movieticket.controller;

import com.booking.movieticket.dto.request.ResetPasswordRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.repository.UserRepository;
import com.booking.movieticket.service.MailSendService;
import com.booking.movieticket.service.ResetPasswordService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequestMapping("/resetPassword")
public class ResetPasswordController {

    UserRepository userRepository;

    MailSendService mailSendService;

    ResetPasswordService resetPasswordService;

    @PostMapping("/")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        try {
            String mail = resetPasswordRequest.getEmail();
            Optional<User> existedUser = userRepository.findByEmail(mail);
            if (existedUser.isPresent()) {
                String newPass = resetPasswordService.resetPassword(existedUser.get());
                mailSendService.sendMail(mail, newPass);
            } else {
                log.error("Not existed mail: {}", mail);
                return ResponseEntity.status(ErrorCode.EMAIL_NOT_EXISTED.getCode())
                        .body(new ApiResponse<>(ErrorCode.EMAIL_NOT_EXISTED.getFormattedMessage()));
            }
            return ResponseEntity.ok(new ApiResponse<>(HttpStatus.OK.value(), "Reset password successful"));
        } catch (Exception e) {
            log.error("Unexpected error during authentication: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Unexpected error: " + e.getMessage()));
        }
    }
}
