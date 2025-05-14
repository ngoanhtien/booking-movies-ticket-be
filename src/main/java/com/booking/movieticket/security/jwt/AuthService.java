package com.booking.movieticket.security.jwt;

import com.booking.movieticket.dto.request.LoginRequest;
import com.booking.movieticket.dto.request.RegisterRequest;
import com.booking.movieticket.dto.request.RefreshTokenRequest;
import com.booking.movieticket.dto.response.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest loginRequest);

    void register(RegisterRequest registerRequest);
    
    LoginResponse refreshToken(RefreshTokenRequest refreshTokenRequest);
}