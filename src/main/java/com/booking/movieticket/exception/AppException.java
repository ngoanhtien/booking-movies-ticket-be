package com.booking.movieticket.exception;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AppException extends RuntimeException {
    private ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    // Constructor chấp nhận ErrorCode với message động
    public AppException(ErrorCode errorCode, Object... args) {
        super(errorCode.formatMessage(args).getFormattedMessage());  // Sử dụng errorCode sau khi định dạng message
        this.errorCode = errorCode;
    }
}
