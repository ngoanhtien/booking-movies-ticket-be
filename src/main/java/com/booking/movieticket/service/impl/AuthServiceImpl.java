package com.booking.movieticket.service.impl;

import com.booking.movieticket.configuration.security.jwt.TokenProvider;
import com.booking.movieticket.dto.request.LoginRequest;
import com.booking.movieticket.dto.request.RegisterRequest;
import com.booking.movieticket.dto.response.LoginResponse;
import com.booking.movieticket.entity.Role;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.entity.enums.MembershipLevel;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.repository.RoleRepository;
import com.booking.movieticket.repository.UserRepository;
import com.booking.movieticket.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final TokenProvider tokenProvider;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            // Create authentication token
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword());

            // Authenticate
            Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Create JWT token
            String jwt = tokenProvider.createToken(authentication);
            String refreshJwt = tokenProvider.generateRefreshToken(authentication);

            // Get role from authorities
            String role = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).findFirst().orElse(""); // Get the first role if any

            // Create and return LoginResponse
            return LoginResponse.builder().accessToken(jwt).refreshToken(refreshJwt).role(role).build();
        } catch (Exception e) {
            log.error(ErrorCode.INVALID_CREDENTIALS.getMessage());
            throw new BadCredentialsException(ErrorCode.INVALID_CREDENTIALS.getMessage());
        }
    }

    @Override
    @Transactional
    public void register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        try {
            Role userRole = roleRepository.findByName("USER").orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Default USER role not found"));
            User user = new User();
            user.setUsername(registerRequest.getUsername());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setFullname(registerRequest.getFullname());
            user.setPhone(registerRequest.getPhone());
            user.setMembershipLevel(MembershipLevel.BASIC);
            user.setIsConfirmed(false); // Require confirmation
            user.setIsDeleted(true); // Account is enabled
            user.setRole(userRole); // Set the USER role

            userRepository.save(user);
        } catch (AppException e) {
            log.error("Registration error: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error(ErrorCode.REGISTER_FAILED.getMessage());
            throw new RuntimeException(ErrorCode.REGISTER_FAILED.getMessage());
        }
    }
}