package com.booking.movieticket.service;

import com.booking.movieticket.dto.request.LoginRequest;
import com.booking.movieticket.dto.request.RegisterRequest;
import com.booking.movieticket.dto.response.LoginResponse;
import com.booking.movieticket.dto.response.RegisterResponse;

public interface AuthService {
    /**
     * Authenticate a user with the provided credentials
     *
     * @param loginRequest login credentials
     * @return authentication response with JWT token and user details
     */
    LoginResponse login(LoginRequest loginRequest);

    /**
     * Register a new user
     *
     * @param registerRequest registration details
     * @return authentication response with JWT token and user details
     */
    RegisterResponse register(RegisterRequest registerRequest);
}