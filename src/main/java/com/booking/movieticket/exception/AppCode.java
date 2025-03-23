package com.booking.movieticket.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.concurrent.ConcurrentHashMap;

@Getter
public enum AppCode {

    LET_VERIFY_2FA(300, "Tài khoản bật xác thực 2 lớp hãy xác thực 2 lớp", HttpStatus.ACCEPTED),
    SENDED_2FA(301, "Đã gửi mã xác thực 2 lớp", HttpStatus.ACCEPTED),
    LET_VERIFY_WITH_GOOGLE_AUTHENTICATOR(301, "Hãy xác thực bằng Google Authenticator", HttpStatus.ACCEPTED),
    OPTION_2FA(302, "Các phương thức bảo mật 2 lớp cài đặt", HttpStatus.ACCEPTED);
    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    // A map to hold additional data for each enum instance
    private static final ConcurrentHashMap<AppCode, Object> additionalDataMap = new ConcurrentHashMap<>();

    // Enum constructor
    AppCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

    // Method to attach additional data
    public AppCode withData(Object additionalData) {
        additionalDataMap.put(this, additionalData);
        return this;
    }

    // Method to get additional data
    public Object getAdditionalData() {
        return additionalDataMap.get(this);
    }
}