package com.booking.movieticket.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private Long bookingId;         // ID của đặt vé
    private String paymentMethod;   // Phương thức thanh toán (QR_SEPAY, QR_MOMO, CREDIT_CARD, etc.)
    private Double amount;          // Số tiền thanh toán
} 