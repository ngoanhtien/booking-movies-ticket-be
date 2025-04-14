package com.booking.movieticket.controller;

import com.booking.movieticket.dto.request.ResetPasswordRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.repository.UserRepository;
import com.booking.movieticket.service.MailSendService;
import com.booking.movieticket.service.ResetPasswordService;
import jakarta.validation.Valid;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/resetPassword")
@Log4j2
public class ResetPasswordController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MailSendService mailSendService;

    @Autowired
    private ResetPasswordService resetPasswordService;

    private PasswordEncoder passwordEncoder;

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
