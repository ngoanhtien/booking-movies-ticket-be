package com.booking.movieticket.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {

    REGISTRATION_FAILED(1000, "Registration failed", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_NOT_FOUND(1001, "User not found", HttpStatus.NOT_FOUND),
    EMAIL_IS_EXISTED(1001, "Email is existed", HttpStatus.NOT_FOUND),
    USERNAME_IS_EXISTED(1001, "Username is existed", HttpStatus.NOT_FOUND),
    PHONE_IS_EXISTED(1001, "Phone is existed", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS(1002, "User already exists", HttpStatus.CONFLICT),
    ROLE_NOT_FOUND(1003, "Role not found", HttpStatus.NOT_FOUND),

    // Content Errors (1100-1199)
    ACTOR_NOT_FOUND(1100, "Actor not found", HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND(1101, "Category not found", HttpStatus.NOT_FOUND),
    MOVIE_NOT_FOUND(1102, "Movie not found", HttpStatus.NOT_FOUND),
    FOOD_NOT_FOUND(1103, "Food item not found", HttpStatus.NOT_FOUND),

    // Cinema Errors (1200-1299)
    CINEMA_NOT_FOUND(1200, "Cinema not found", HttpStatus.NOT_FOUND),
    SHOWTIME_NOT_FOUND(1201, "Showtime not found", HttpStatus.NOT_FOUND),
    SHOWTIMESEAT_NOT_FOUND(1202, "Showtime seat not found", HttpStatus.NOT_FOUND),
    SHOWING_MOVIE_NOT_FOUND(1203, "Showing movie not found", HttpStatus.NOT_FOUND),
    UPCOMING_MOVIE_NOT_FOUND(1203, "Showing movie not found", HttpStatus.NOT_FOUND),

    // Transaction Errors (1300-1399)
    BILL_NOT_FOUND(1300, "Bill not found", HttpStatus.NOT_FOUND),
    PAYMENT_FAILED(1301, "Payment processing failed", HttpStatus.PAYMENT_REQUIRED),

    // File Upload Errors (1400-1499)
    MOVIE_IMAGE_UPLOAD_FAILED(1400, "Failed to upload movie image", HttpStatus.INTERNAL_SERVER_ERROR),
    UPLOAD_IMAGE_FAILED(1401, "Upload image cannot be empty or null", HttpStatus.BAD_REQUEST),

    // General Errors (9000-9999)
    BAD_REQUEST(9000, "Bad request", HttpStatus.BAD_REQUEST),
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR);


    ErrorCode(String message) {
        this.message = message;
        this.originalMessage = message;
    }

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
        this.originalMessage = message;
    }

    ErrorCode(int code, String message, HttpStatusCode status) {
        this.code = code;
        this.originalMessage = message;
        this.message = message;
        this.statusCode = status;
    }

    private int code;
    private String message;
    private HttpStatusCode statusCode;
    private final String originalMessage;

    public ErrorCode formatMessage(Object... args) {
        this.message = String.format(this.originalMessage, args);
        return this;
    }

    public String getFormattedMessage() {
        return this.message;
    }
}