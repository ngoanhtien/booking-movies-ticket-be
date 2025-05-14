package com.booking.movieticket.security.jwt;

import com.booking.movieticket.dto.request.LoginRequest;
import com.booking.movieticket.dto.request.RegisterRequest;
import com.booking.movieticket.dto.request.RefreshTokenRequest;
import com.booking.movieticket.dto.response.LoginResponse;
import com.booking.movieticket.entity.Role;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.entity.enums.MembershipLevel;
import com.booking.movieticket.entity.enums.SignupDevice;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.repository.RoleRepository;
import com.booking.movieticket.repository.UserRepository;
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

            // Create and return LoginResponse
            return LoginResponse.builder().accessToken(jwt).refreshToken(refreshJwt).build();
        } catch (Exception e) {
            log.error(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());
            throw new BadCredentialsException(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());
        }
    }

    @Override
    @Transactional
    public void register(RegisterRequest registerRequest) {
        try {
            if (userRepository.existsByUsername(registerRequest.getUsername())) {
                throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
            }
            // Check if email already exists
            if (userRepository.existsByEmail(registerRequest.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }

            // Lấy vai trò USER mặc định thay vì từ request
            Role userRole = roleRepository.findByName("USER") 
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
            User user = new User();
            user.setUsername(registerRequest.getUsername());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setFullName(registerRequest.getFullName());
            user.setEmail(registerRequest.getEmail());
            user.setMembershipLevel(MembershipLevel.BASIC);
            user.setIsConfirmed(false);
            user.setIsDeleted(false);
            user.setSignupDevice(SignupDevice.NORMAL);
            user.setRole(userRole);

            userRepository.save(user);
        } catch (AppException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public LoginResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
        try {
            log.info("Starting refresh token process");
            // Xác thực refresh token
            if (refreshTokenRequest.getRefreshToken() == null || refreshTokenRequest.getRefreshToken().isEmpty()) {
                log.error("Refresh token is null or empty");
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }
            
            // Xác thực và tạo token mới từ refresh token
            String username = tokenProvider.getUsernameFromRefreshToken(refreshTokenRequest.getRefreshToken());
            log.info("Username from refresh token: {}", username);
            if (username == null) {
                log.error("Could not extract username from refresh token");
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }
            
            // Tìm thông tin người dùng
            log.info("Finding user with username: {}", username);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> {
                        log.error("User not found with username: {}", username);
                        return new AppException(ErrorCode.USER_NOT_FOUND);
                    });
            log.info("User found: {}", user.getId());
            
            // Tạo authentication từ thông tin người dùng
            DomainUserDetails userDetails = new DomainUserDetails(user);
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
            
            // Tạo token mới
            String jwt = tokenProvider.createToken(authentication);
            String refreshJwt = tokenProvider.generateRefreshToken(authentication);
            log.info("New tokens generated successfully");
            
            // Trả về tokens mới
            return LoginResponse.builder()
                    .accessToken(jwt)
                    .refreshToken(refreshJwt)
                    .build();
        } catch (Exception e) {
            log.error("Error refreshing token: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }
}