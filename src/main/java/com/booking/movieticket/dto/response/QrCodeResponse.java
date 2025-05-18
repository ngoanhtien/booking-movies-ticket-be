package com.booking.movieticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrCodeResponse {
    private String qrImageUrl;      // URL của hình ảnh QR code
    private String qrContent;       // Nội dung của QR code (URL thanh toán)
    private String provider;        // Nhà cung cấp (SePay, MoMo, etc.)
    private String paymentId;       // ID của giao dịch thanh toán
    private Long expiryTime;        // Thời gian hết hạn tính bằng epoch millis
    private Long bookingId;         // ID của đặt vé
    private Double amount;          // Số tiền thanh toán
    private String htmlCode;        // Mã HTML để nhúng QR nếu cần
} 