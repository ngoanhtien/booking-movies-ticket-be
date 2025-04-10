package com.booking.movieticket.service.impl;

import com.booking.movieticket.configuration.security.jwt.TokenProvider;
import com.booking.movieticket.dto.request.LoginRequest;
import com.booking.movieticket.dto.request.RegisterRequest;
import com.booking.movieticket.dto.response.AuthResponse;
import com.booking.movieticket.entity.Role;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.entity.enums.MembershipLevel;
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

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

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
    public AuthResponse login(LoginRequest loginRequest) {
        try {
            // Create authentication token
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword());

            // Authenticate
            Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Create JWT token
            String jwt = tokenProvider.createToken(authentication);

            String refreshJwt = tokenProvider.generateRefreshToken(authentication);

            // Get user details
            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Create response
            Set<String> roles = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toSet());

            return AuthResponse.builder()
                    .message("Login successful")
                    .accessToken(jwt)
                    .refreshToken(refreshJwt)
                    .roles(roles)
                    .build();
        } catch (Exception e) {
            log.error("Authentication error: {}", e.getMessage());
            throw new BadCredentialsException("Authentication failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        try {
            // Create new user
            User user = new User();
            user.setUsername(registerRequest.getUsername());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setFullname(registerRequest.getFullname());
            user.setPhone(registerRequest.getPhone());
            user.setMembershipLevel(MembershipLevel.BASIC); // Default membership level
            user.setIsConfirmed(false); // Require confirmation

            // Add default role (USER)
            Set<Role> roles = new HashSet<>();
            Role userRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new RuntimeException("Default role not found"));
            roles.add(userRole);
            user.setRoles(roles);

            // Save user to database
            userRepository.save(user);

            // Authenticate the new user
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(registerRequest.getUsername(), registerRequest.getPassword());
            Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate token
            String jwt = tokenProvider.createToken(authentication);

            // Create response
            Set<String> roleNames = roles.stream()
                    .map(Role::getName)
                    .collect(Collectors.toSet());

            return AuthResponse.builder()
                    .tokenType("Bearer")
                    .accessToken(jwt)
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .fullname(user.getFullname())
                    .roles(roleNames)
                    .build();
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage());
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }
}