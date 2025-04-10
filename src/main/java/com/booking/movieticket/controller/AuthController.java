package com.booking.movieticket.controller;

import com.booking.movieticket.dto.request.LoginRequest;
import com.booking.movieticket.dto.request.RegisterRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.AuthResponse;
import com.booking.movieticket.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse authResponse = authService.login(loginRequest);
            return ResponseEntity.ok().body(authResponse);
        } catch (RuntimeException e) {
            log.error("Authentication error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(HttpStatus.UNAUTHORIZED.value(), "Authentication failed: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during authentication: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Unexpected error: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            AuthResponse authResponse = authService.register(registerRequest);
            return ResponseEntity.ok(new ApiResponse<>(HttpStatus.CREATED.value(), "User registered successfully", authResponse));
        } catch (RuntimeException e) {
            log.error("Registration error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Registration failed: " + e.getMessage()));
        }
    }
}