package com.booking.movieticket.service.impl;

import com.booking.movieticket.configuration.payment.SePayConfig;
import com.booking.movieticket.dto.request.PaymentRequest;
import com.booking.movieticket.dto.response.QrCodeResponse;
import com.booking.movieticket.service.BookingService;
import com.booking.movieticket.service.PaymentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class PaymentServiceImpl implements PaymentService {

    SePayConfig sePayConfig;
    BookingService bookingService;
    
    // Trong môi trường thực tế, cần lưu trạng thái này vào database
    private static final Map<String, String> paymentStatusMap = new HashMap<>();

    @Override
    public QrCodeResponse generateQrCode(PaymentRequest paymentRequest) {
        log.info("Generating QR code for payment: {}", paymentRequest);
        
        // Tạo ID thanh toán
        String paymentId = "PAY-" + UUID.randomUUID().toString().substring(0, 8);
        
        // Tính thời gian hết hạn (5 phút)
        long expiryTime = LocalDateTime.now().plusMinutes(5).toInstant(ZoneOffset.UTC).toEpochMilli();
        
        String paymentMethod = paymentRequest.getPaymentMethod();
        
        if ("QR_SEPAY".equals(paymentMethod)) {
            return generateSePayQrCode(paymentRequest, paymentId, expiryTime);
        } else if ("QR_MOMO".equals(paymentMethod)) {
            return generateMoMoQrCode(paymentRequest, paymentId, expiryTime);
        } else {
            throw new IllegalArgumentException("Unsupported QR payment method: " + paymentMethod);
        }
    }
    
    private QrCodeResponse generateSePayQrCode(PaymentRequest paymentRequest, String paymentId, long expiryTime) {
        // Tạo URL thanh toán SePay
        String merchantId = sePayConfig.getMerchantId();
        String callbackUrl = sePayConfig.getCallbackUrl();
        
        // Giả định và tạo URL QR code cho SePay (trong thực tế cần tích hợp với API của SePay)
        String qrContent = String.format("https://gr-sepay.vn/log?key=%s&amount=%s&id=%s", 
                "VPDGY4XfU1HdNkmup9MRma8", // Mã merchant key giả định
                paymentRequest.getAmount(),
                paymentId);
        
        // URL ảnh QR code (trong thực tế sẽ được tạo bởi API của SePay hoặc thư viện QR generator)
        String qrImageUrl = String.format("https://api.qrserver.com/v1/create-qr-code/?data=%s&size=200x200", qrContent);
        
        // Mã HTML để nhúng QR code
        String htmlCode = String.format("<img src=\"%s\" alt=\"Payment QR Code\" />", qrImageUrl);
        
        // Cập nhật trạng thái thanh toán (PENDING)
        paymentStatusMap.put(paymentId, "PENDING");
        
        return QrCodeResponse.builder()
                .qrImageUrl(qrImageUrl)
                .qrContent(qrContent)
                .provider("SEPAY")
                .paymentId(paymentId)
                .expiryTime(expiryTime)
                .bookingId(paymentRequest.getBookingId())
                .amount(paymentRequest.getAmount())
                .htmlCode(htmlCode)
                .build();
    }
    
    private QrCodeResponse generateMoMoQrCode(PaymentRequest paymentRequest, String paymentId, long expiryTime) {
        // Tạo URL thanh toán MoMo (giả định)
        String qrContent = String.format("https://payment.momo.vn/%s?amount=%s", 
                paymentId, 
                paymentRequest.getAmount());
        
        // URL ảnh QR code (trong thực tế sẽ được tạo bởi API của MoMo hoặc thư viện QR generator)
        String qrImageUrl = String.format("https://api.qrserver.com/v1/create-qr-code/?data=%s&size=200x200", qrContent);
        
        // Mã HTML để nhúng QR code
        String htmlCode = String.format("<img src=\"%s\" alt=\"MoMo Payment QR Code\" />", qrImageUrl);
        
        // Cập nhật trạng thái thanh toán (PENDING)
        paymentStatusMap.put(paymentId, "PENDING");
        
        return QrCodeResponse.builder()
                .qrImageUrl(qrImageUrl)
                .qrContent(qrContent)
                .provider("MOMO")
                .paymentId(paymentId)
                .expiryTime(expiryTime)
                .bookingId(paymentRequest.getBookingId())
                .amount(paymentRequest.getAmount())
                .htmlCode(htmlCode)
                .build();
    }

    @Override
    public boolean checkPaymentStatus(String paymentId) {
        log.info("Checking payment status for paymentId: {}", paymentId);
        String status = paymentStatusMap.getOrDefault(paymentId, "NOT_FOUND");
        return "SUCCESS".equals(status);
    }

    @Override
    public boolean updatePaymentStatus(String paymentId, String status) {
        log.info("Updating payment status for paymentId: {} to {}", paymentId, status);
        paymentStatusMap.put(paymentId, status);
        return true;
    }

    @Override
    public boolean cancelPayment(String paymentId) {
        log.info("Cancelling payment for paymentId: {}", paymentId);
        paymentStatusMap.put(paymentId, "CANCELLED");
        return true;
    }
} 