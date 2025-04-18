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




}
