package com.booking.movieticket.controller;

import com.booking.movieticket.dto.request.PaymentRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.QrCodeResponse;
import com.booking.movieticket.service.PaymentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequestMapping("/api/v1/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    PaymentService paymentService;

    @PostMapping("/generate-qr")
    public ResponseEntity<ApiResponse<?>> generateQrCode(@RequestBody PaymentRequest paymentRequest) {
        log.info("Generating QR code for payment: {}", paymentRequest);
        QrCodeResponse qrCodeResponse = paymentService.generateQrCode(paymentRequest);
        return ResponseEntity.ok(new ApiResponse<>("QR code generated successfully", qrCodeResponse));
    }

    @GetMapping("/status/{paymentId}")
    public ResponseEntity<ApiResponse<?>> checkPaymentStatus(@PathVariable String paymentId) {
        log.info("Checking payment status for paymentId: {}", paymentId);
        boolean isPaid = paymentService.checkPaymentStatus(paymentId);
        return ResponseEntity.ok(new ApiResponse<>("Payment status retrieved", Map.of("paid", isPaid)));
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<?>> paymentWebhook(
            @RequestBody Map<String, String> payload) {
        log.info("Received payment webhook: {}", payload);
        
        String paymentId = payload.get("paymentId");
        String status = payload.get("status");
        
        if (paymentId == null || status == null) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("Invalid webhook payload", null));
        }
        
        boolean updated = paymentService.updatePaymentStatus(paymentId, status);
        return ResponseEntity.ok(new ApiResponse<>("Payment status updated", Map.of("updated", updated)));
    }

    @PostMapping("/cancel/{paymentId}")
    public ResponseEntity<ApiResponse<?>> cancelPayment(@PathVariable String paymentId) {
        log.info("Cancelling payment for paymentId: {}", paymentId);
        boolean cancelled = paymentService.cancelPayment(paymentId);
        return ResponseEntity.ok(new ApiResponse<>("Payment cancelled", Map.of("cancelled", cancelled)));
    }
} 