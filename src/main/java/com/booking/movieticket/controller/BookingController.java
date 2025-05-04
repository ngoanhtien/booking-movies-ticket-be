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

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequestMapping("/payment")
@CrossOrigin(origins = "*")
public class BookingController {

    BookingService bookingService;

    @PostMapping("/sepay-webhook")
    public ResponseEntity<ApiResponse<?>> createBooking(
            @AuthenticationPrincipal DomainUserDetails userDetails,
            @RequestBody BookingRequest bookingRequest,
            @RequestBody Map<String, Object> payload) {
        log.info("Creating booking for user: {}", userDetails.getUserId());
        BookingResponse bookingResponse = bookingService.createBooking(userDetails.getUserId(), bookingRequest);
        return ResponseEntity.ok(new ApiResponse<>("Booking created successfully", bookingResponse));
    }

    /**
     * Lấy thông tin chi tiết đơn đặt vé
     *
     * @param bookingId ID của đơn đặt vé
     * @return Thông tin chi tiết đơn đặt vé
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<?>> getBookingDetails(@PathVariable Long bookingId) {
        log.info("Getting details for booking: {}", bookingId);
        BookingResponse bookingResponse = bookingService.getBookingDetails(bookingId);
        return ResponseEntity.ok(new ApiResponse<>("Booking details retrieved successfully", bookingResponse));
    }
}