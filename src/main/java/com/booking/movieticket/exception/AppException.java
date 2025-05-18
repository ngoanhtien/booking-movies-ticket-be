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

    public AppException(ErrorCode errorCode, Object... args) {
        super(errorCode.formatMessage(args).getFormattedMessage());
        this.errorCode = errorCode;
    }
}
