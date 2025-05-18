package com.booking.movieticket.controller;

import com.booking.movieticket.dto.request.BookingRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.BookingResponse;
import com.booking.movieticket.security.jwt.DomainUserDetails;
import com.booking.movieticket.service.BookingService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequestMapping("/bookings")
@CrossOrigin(origins = "*")
public class BookingAltController {

    BookingService bookingService;
    
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<?>> createBooking(
            @AuthenticationPrincipal DomainUserDetails userDetails,
            @RequestBody BookingRequest bookingRequest) {
        log.info("============== BOOKING ALT CONTROLLER ==============");
        log.info("Received booking request at /bookings/create endpoint");
        log.info("User details: {}", userDetails);
        log.info("Request headers: {}", ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest().getHeaderNames());
        log.info("Booking request data: {}", bookingRequest);
        
        // Nếu userDetails là null (có thể xảy ra nếu chưa đăng nhập), sử dụng ID mặc định
        Long userId = userDetails != null ? userDetails.getUserId() : 1L; // ID mặc định cho test  
        
        log.info("Processing booking for user ID: {}", userId);
        BookingResponse bookingResponse = bookingService.createBooking(userId, bookingRequest);
        log.info("Booking created successfully with id: {}", bookingResponse.getBookingId());
        return ResponseEntity.ok(new ApiResponse<>("Booking created successfully", bookingResponse));
    }
} 