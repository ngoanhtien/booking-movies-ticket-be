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
@RequestMapping("/api/v1/bookings")
@CrossOrigin(origins = "*")
public class ApiBookingController {

    BookingService bookingService;
    
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<?>> createBooking(
            @AuthenticationPrincipal DomainUserDetails userDetails,
            @RequestBody BookingRequest bookingRequest) {
        log.info("============== API V1 BOOKING CONTROLLER ==============");
        log.info("Received booking request at /api/v1/bookings/create endpoint");
        log.info("User details: {}", userDetails);
        log.info("Booking request data: {}", bookingRequest);
        
        // Nếu userDetails là null (có thể xảy ra nếu chưa đăng nhập), sử dụng ID mặc định
        Long userId = userDetails != null ? userDetails.getUserId() : 1L; // ID mặc định cho test  
        
        log.info("Processing booking for user ID: {}", userId);
        try {
            BookingResponse bookingResponse = bookingService.createBooking(userId, bookingRequest);
            log.info("Booking created successfully with id: {}", bookingResponse.getBookingId());
            return ResponseEntity.ok(new ApiResponse<>("Booking created successfully", bookingResponse));
        } catch (Exception e) {
            log.error("Error creating booking: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new ApiResponse<>("Error creating booking: " + e.getMessage(), null));
        }
    }
    
    @PostMapping("/payment/qr-code")
    public ResponseEntity<ApiResponse<?>> generateQRCode(
            @AuthenticationPrincipal DomainUserDetails userDetails,
            @RequestBody Map<String, Object> paymentRequest) {
        log.info("============== QR CODE PAYMENT API ==============");
        log.info("Received payment QR request");
        log.info("User details: {}", userDetails);
        log.info("Payment request: {}", paymentRequest);
        
        // Tạo mã QR giả lập (thông thường sẽ gọi đến payment gateway)
        Map<String, Object> qrResponse = Map.of(
            "qrCode", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAABA0lEQVR42uyYMY6DMBBFvyMqKiokL8AlUJ9gcwQOwREpUqRIkTJFJXbgAJEopdnRRIRdRqRhSjzxyk/jL8s/NvMXWBe96EU/oydDLfKQzNdmHXJ5BdSFm+yTv0EF+eq9vJdCkon5CnSWx1qAQtKsQK2kUYHkVyrQRdJiA9JlBXokaTTOkrYB6TN2rz+R9JiQt4Y5Ds1/DJ76sCBJn8AbsEuA6tJpgPoSuMdJYzHATdK8AGqKr5ImA1wljSugc2lpCfQqaVgAN0mjBUjfvNMA30saLEC6yz4N8EfSMwdOkmYdOH4sJiuQvisLDbSVNonynw10lSbtmanTTdLa3hf96EWv9QVCCPxWwi1PNQAAAABJRU5ErkJggg==",
            "paymentId", "QR" + System.currentTimeMillis(),
            "amount", paymentRequest.get("amount"),
            "expiresIn", 300 // 5 minutes in seconds
        );
        
        return ResponseEntity.ok(new ApiResponse<>("QR code generated successfully", qrResponse));
    }
    
    @PostMapping("/payment/verify")
    public ResponseEntity<ApiResponse<?>> verifyPayment(
            @RequestBody Map<String, Object> verificationRequest) {
        log.info("============== PAYMENT VERIFICATION API ==============");
        log.info("Received payment verification request: {}", verificationRequest);
        
        String paymentId = (String) verificationRequest.get("paymentId");
        
        // Giả lập xác minh thanh toán thành công
        Map<String, Object> verificationResponse = Map.of(
            "paymentId", paymentId,
            "status", "SUCCESS",
            "transactionId", "TX" + System.currentTimeMillis(),
            "message", "Payment verified successfully"
        );
        
        return ResponseEntity.ok(new ApiResponse<>("Payment verification successful", verificationResponse));
    }
    
    @GetMapping("/food-items")
    public ResponseEntity<ApiResponse<?>> getFoodItems() {
        log.info("============== GET FOOD ITEMS API ==============");
        
        // Tạo danh sách đồ ăn/nước uống giả lập
        var foodItems = java.util.List.of(
            Map.of(
                "id", 1,
                "name", "Popcorn (L)",
                "description", "Large size popcorn",
                "price", 79000,
                "imageUrl", "https://www.cgv.vn/media/concession/web/625x275/a0b94750525f6c975113dfb60de3aa51.png"
            ),
            Map.of(
                "id", 2,
                "name", "Coca Cola (M)",
                "description", "Medium size coca cola",
                "price", 39000,
                "imageUrl", "https://www.cgv.vn/media/concession/web/625x275/b5830f994b86927804b569d617a3db68.png"
            ),
            Map.of(
                "id", 3,
                "name", "Combo 1 (Popcorn + 2 Cola)",
                "description", "Large popcorn with 2 medium cola",
                "price", 149000,
                "imageUrl", "https://www.cgv.vn/media/concession/web/625x275/84527d42cb5d6888213920437ef50ee4.png"
            )
        );
        
        return ResponseEntity.ok(new ApiResponse<>("Food items retrieved successfully", foodItems));
    }
} 