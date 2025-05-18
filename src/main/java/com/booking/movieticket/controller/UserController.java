package com.booking.movieticket.controller;

import com.booking.movieticket.dto.request.ResetPasswordRequest;
import com.booking.movieticket.dto.request.admin.update.UserForUpdateRequest;
import com.booking.movieticket.dto.request.admin.create.UserForCreateRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.admin.UserResponse;
import com.booking.movieticket.dto.response.admin.create.UserCreatedResponse;
import com.booking.movieticket.dto.criteria.UserCriteria;
import com.booking.movieticket.entity.User;
import com.booking.movieticket.service.MailSendService;
import com.booking.movieticket.service.UserService;
import com.booking.movieticket.service.BookingService;
import com.booking.movieticket.dto.response.BookingHistoryResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.booking.movieticket.dto.response.UserDetailResponse;
import com.booking.movieticket.security.jwt.DomainUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
@CrossOrigin(origins = "*")
@Validated
public class UserController {

    UserService userService;
    BookingService bookingService;
    MailSendService mailSendService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(UserCriteria userCriteria, @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>("Users fetched successfully.", userService.getAllUsers(userCriteria, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>("User details fetched successfully.", userService.getUserById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserCreatedResponse>> createUser(@RequestPart("user") @Valid UserForCreateRequest userRequest, @RequestPart(value = "avatarUrl", required = false) MultipartFile avatarUrl, BindingResult bindingResult) throws MethodArgumentNotValidException {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>("User created successfully.", userService.createUser(userRequest, avatarUrl, bindingResult)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<String>> updateUser(@Valid @RequestPart("user") UserForUpdateRequest userRequest, @RequestPart(value = "avatarUrl", required = false) MultipartFile avatarUrl, BindingResult bindingResult) throws MethodArgumentNotValidException {
        userService.updateUser(userRequest, avatarUrl, bindingResult);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(new ApiResponse<>("User details fetched successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> activateUser(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        userService.activateUser(id);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(new ApiResponse<>("User activated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateUser(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>("User deactivated successfully."));
    }

    @PostMapping("/resetPassword")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        try {
            String mail = resetPasswordRequest.getEmail();
            User existedUser = userService.findUser(mail);
            String newPass = userService.resetPassword(existedUser);
            mailSendService.sendMail(mail, newPass);
            return ResponseEntity.ok(new ApiResponse<>(HttpStatus.OK.value(), "Reset password successful."));
        } catch (Exception e) {
            log.error("Unexpected error during authentication: {}.", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Unexpected error: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getCurrentUser() {
        log.info("Attempting to get current user info for /user/me endpoint...");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String && "anonymousUser".equals(authentication.getPrincipal())) {
            log.warn("No authenticated user found for /user/me");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                           .body(new ApiResponse<>("User not authenticated", null));
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof DomainUserDetails) {
            DomainUserDetails userDetails = (DomainUserDetails) principal;
            Long userId = userDetails.getUserId();
            log.info("Authenticated user ID for /user/me: {}", userId);
            User userEntity = userService.findUserById(userId);

            UserDetailResponse userDetailResponse = new UserDetailResponse();
            if (userEntity != null) {
                userDetailResponse.setId(userEntity.getId());
                userDetailResponse.setUsername(userEntity.getUsername());
                userDetailResponse.setFullName(userEntity.getFullName());
                userDetailResponse.setEmail(userEntity.getEmail());
                if (userEntity.getRole() != null) {
                    userDetailResponse.setRole(userEntity.getRole().getName());
                }
                // Set other fields as needed
                // userDetailResponse.setAvatarUrl(userEntity.getAvatarUrl());
            } else {
                log.error("User not found in database with ID: {}", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                               .body(new ApiResponse<>("User details not found in database.", null));
            }

            return ResponseEntity.ok(new ApiResponse<>("Current user details fetched successfully.", userDetailResponse));
        } else {
            log.error("Principal is not an instance of DomainUserDetails for /user/me. Principal type: {}", principal.getClass().getName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                           .body(new ApiResponse<>("Error processing user details.", null));
        }
    }
    
    /**
     * Gets booking history for the currently authenticated user
     * @return List of user's booking history
     */
    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingHistoryResponse>>> getUserBookings() {
        log.info("Fetching booking history for current user");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String && "anonymousUser".equals(authentication.getPrincipal())) {
            log.warn("No authenticated user found when accessing booking history");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>("User not authenticated", null));
        }

        try {
            Object principal = authentication.getPrincipal();
            if (principal instanceof DomainUserDetails) {
                DomainUserDetails userDetails = (DomainUserDetails) principal;
                Long userId = userDetails.getUserId();
                log.info("Fetching booking history for user ID: {}", userId);

                List<BookingHistoryResponse> bookingHistory = bookingService.getUserBookingHistory(userId);
                return ResponseEntity.ok(new ApiResponse<>("User booking history fetched successfully", bookingHistory));
            } else {
                log.error("Principal is not an instance of DomainUserDetails when fetching booking history. Type: {}", principal.getClass().getName());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ApiResponse<>("Error processing user details", null));
            }
        } catch (Exception e) {
            log.error("Error fetching booking history: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Error fetching booking history: " + e.getMessage(), null));
        }
    }
}
