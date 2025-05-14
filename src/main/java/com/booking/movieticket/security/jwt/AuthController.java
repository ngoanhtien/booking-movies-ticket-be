package com.booking.movieticket.security.jwt;

import com.booking.movieticket.dto.request.LoginRequest;
import com.booking.movieticket.dto.request.RegisterRequest;
import com.booking.movieticket.dto.request.RefreshTokenRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.LoginResponse;
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

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequestMapping("/auth")
public class AuthController {

    AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse loginResponse = authService.login(loginRequest);
        return ResponseEntity.ok(new ApiResponse<>("Authentication successful", loginResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>("Registration successful"));
    }
    
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        log.info("Refreshing token at /auth/refresh-token");
        LoginResponse loginResponse = authService.refreshToken(refreshTokenRequest);
        return ResponseEntity.ok(new ApiResponse<>("Token refreshed successfully", loginResponse));
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshTokenLegacy(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        log.info("Refreshing token at legacy endpoint /auth/refresh");
        LoginResponse loginResponse = authService.refreshToken(refreshTokenRequest);
        return ResponseEntity.ok(new ApiResponse<>("Token refreshed successfully", loginResponse));
    }
}