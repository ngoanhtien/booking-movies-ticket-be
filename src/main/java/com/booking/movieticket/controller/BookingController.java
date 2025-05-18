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
            @RequestBody BookingRequest bookingRequest) {
        log.info("============== PAYMENT CONTROLLER (sepay-webhook) ==============");
        log.info("Received booking request at /payment/sepay-webhook endpoint");
        log.info("User details: {}", userDetails);
        log.info("Booking request: {}", bookingRequest);
        
        // Nếu userDetails là null (có thể xảy ra nếu chưa đăng nhập), sử dụng ID mặc định
        Long userId = userDetails != null ? userDetails.getUserId() : 1L; // ID mặc định cho test  
        
        log.info("Processing booking for user ID: {}", userId);
        BookingResponse bookingResponse = bookingService.createBooking(userId, bookingRequest);
        log.info("Booking created successfully with id: {}", bookingResponse.getBookingId());
        return ResponseEntity.ok(new ApiResponse<>("Booking created successfully", bookingResponse));
    }
    
    @PostMapping("/process")
    public ResponseEntity<ApiResponse<?>> processPayment(
            @RequestBody Map<String, Object> paymentRequest) {
        log.info("============== PAYMENT CONTROLLER (process) ==============");
        log.info("Processing payment: {}", paymentRequest);
        // Mô phỏng xử lý thanh toán thành công
        return ResponseEntity.ok(new ApiResponse<>("Payment processed successfully", 
                Map.of("status", "SUCCESS", "transactionId", "mock-" + System.currentTimeMillis())));
    }
    
    @PostMapping("/bookings/create")
    public ResponseEntity<ApiResponse<?>> createBookingAlternative(
            @AuthenticationPrincipal DomainUserDetails userDetails,
            @RequestBody BookingRequest bookingRequest) {
        log.info("============== PAYMENT CONTROLLER (bookings/create) ==============");
        log.info("Received booking request at /payment/bookings/create endpoint");
        log.info("User details: {}", userDetails);
        log.info("Booking request: {}", bookingRequest);
        return createBooking(userDetails, bookingRequest);
    }

    /**
     * Lấy thông tin chi tiết đơn đặt vé
     *
     * @param bookingId ID của đơn đặt vé
     * @return Thông tin chi tiết đơn đặt vé
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<?>> getBookingDetails(@PathVariable Long bookingId) {
        log.info("============== PAYMENT CONTROLLER (get booking) ==============");
        log.info("Getting details for booking: {}", bookingId);
        BookingResponse bookingResponse = bookingService.getBookingDetails(bookingId);
        return ResponseEntity.ok(new ApiResponse<>("Booking details retrieved successfully", bookingResponse));
    }

    @GetMapping("/test-booking")
    public ResponseEntity<ApiResponse<?>> testBooking() {
        log.info("============== PAYMENT CONTROLLER (test-booking) ==============");
        // Tạo một BookingResponse mẫu cho mục đích test
        BookingResponse mockResponse = new BookingResponse();
        mockResponse.setBookingId(999L); // ID mẫu
        mockResponse.setBookingCode("TEST-" + System.currentTimeMillis());
        
        // Thêm các thông tin khác
        mockResponse.setMovie(new BookingResponse.MovieInfo(
            1L, "Test Movie", com.booking.movieticket.entity.enums.RoomType.STANDARD, 
            java.time.LocalDate.parse("2023-12-01"), 
            java.time.LocalTime.parse("19:00"), 
            java.time.LocalTime.parse("21:00")
        ));
        
        mockResponse.setCinema(new BookingResponse.CinemaInfo(
            "Test Cinema", "Test Room", "123 Test Street"
        ));
        
        mockResponse.setSeats(java.util.Arrays.asList("A1", "A2"));
        mockResponse.setTotalAmount(200000.0);
        mockResponse.setFoodItems(java.util.Arrays.asList(
            new BookingResponse.FoodItem("Popcorn", 1, 50000.0),
            new BookingResponse.FoodItem("Coke", 2, 25000.0)
        ));
        
        log.info("Created test booking with id: {}", mockResponse.getBookingId());
        return ResponseEntity.ok(new ApiResponse<>("Test booking created", mockResponse));
    }
    
    @PostMapping("/simulate")
    public ResponseEntity<ApiResponse<?>> simulatePayment(@RequestBody Map<String, Object> paymentRequest) {
        log.info("============== PAYMENT CONTROLLER (simulate) ==============");
        log.info("Simulating payment: {}", paymentRequest);
        // Mô phỏng xử lý thanh toán thành công
        return ResponseEntity.ok(new ApiResponse<>("Payment simulation successful", 
                Map.of("status", "SUCCESS", 
                       "transactionId", "mock-" + System.currentTimeMillis(),
                       "bookingId", paymentRequest.get("bookingId"))));
    }
}