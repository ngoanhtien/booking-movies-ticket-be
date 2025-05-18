package com.booking.movieticket.service;

import com.booking.movieticket.dto.request.BookingRequest;
import com.booking.movieticket.dto.response.BookingResponse;
import com.booking.movieticket.dto.response.BookingHistoryResponse;

import java.util.List;

import java.util.List;

public interface BookingService {
    /**
     * Tạo một đơn đặt vé mới với các ghế và đồ ăn đã chọn
     * @param userId ID của người dùng
     * @param bookingRequest Thông tin đặt vé
     * @return Thông tin đơn đặt vé với mã QR thanh toán
     */
    BookingResponse createBooking(Long userId, BookingRequest bookingRequest);

    /**
     * Get booking history for a specific user
     * @param userId ID of the user
     * @return List of booking responses
     */
    List<BookingResponse> getUserBookingHistory(Long userId);

    /**
     * Lấy thông tin đơn đặt vé
     * @param bookingId ID của đơn đặt vé
     * @return Thông tin đơn đặt vé
     */
    BookingResponse getBookingDetails(Long bookingId);
    
    /**
     * Lấy lịch sử đặt vé của người dùng
     * @param userId ID của người dùng
     * @return Danh sách đơn đặt vé của người dùng
     */
    List<BookingHistoryResponse> getUserBookingHistory(Long userId);
}