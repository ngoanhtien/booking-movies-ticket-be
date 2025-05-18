package com.booking.movieticket.service;

import com.booking.movieticket.dto.request.PaymentRequest;
import com.booking.movieticket.dto.response.QrCodeResponse;

public interface PaymentService {
    
    /**
     * Tạo mã QR thanh toán cho đơn đặt vé
     * @param paymentRequest Thông tin thanh toán
     * @return Thông tin mã QR thanh toán
     */
    QrCodeResponse generateQrCode(PaymentRequest paymentRequest);
    
    /**
     * Kiểm tra trạng thái thanh toán
     * @param paymentId ID của giao dịch thanh toán
     * @return true nếu đã thanh toán, false nếu chưa
     */
    boolean checkPaymentStatus(String paymentId);
    
    /**
     * Cập nhật trạng thái thanh toán (webhook từ SePay/MoMo)
     * @param paymentId ID của giao dịch thanh toán
     * @param status Trạng thái thanh toán
     * @return true nếu cập nhật thành công
     */
    boolean updatePaymentStatus(String paymentId, String status);
    
    /**
     * Hủy thanh toán khi hết thời gian
     * @param paymentId ID của giao dịch thanh toán
     * @return true nếu hủy thành công
     */
    boolean cancelPayment(String paymentId);
} 