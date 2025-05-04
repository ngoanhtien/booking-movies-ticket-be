package com.booking.movieticket.service;

import com.booking.movieticket.dto.request.BookingRequest;
import com.booking.movieticket.dto.response.BookingResponse;

public interface BookingService {
    /**
     * Tạo một đơn đặt vé mới với các ghế và đồ ăn đã chọn
     * @param userId ID của người dùng
     * @param bookingRequest Thông tin đặt vé
     * @return Thông tin đơn đặt vé với mã QR thanh toán
     */
    BookingResponse createBooking(Long userId, BookingRequest bookingRequest);

    /**
     * Lấy thông tin đơn đặt vé
     * @param bookingId ID của đơn đặt vé
     * @return Thông tin đơn đặt vé
     */
    BookingResponse getBookingDetails(Long bookingId);
}