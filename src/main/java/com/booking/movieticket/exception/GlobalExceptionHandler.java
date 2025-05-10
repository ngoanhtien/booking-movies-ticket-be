package com.booking.movieticket.exception;

import com.booking.movieticket.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse<?>> handlingException(Exception ex, HttpServletResponse response) {
        log.error("Unhandled exception occurred: {}", ex.getMessage(), ex);
        if (response.isCommitted()) {
            log.warn("Response already committed. Cannot send error response body for unhandled exception: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.internalServerError().body(new ApiResponse<>(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode(), ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage()));
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<?>> handlingAppException(AppException ex, HttpServletResponse response) {
        ErrorCode errorCode = ex.getErrorCode();
        log.warn("AppException occurred: Code - {}, Message - {}", errorCode.getCode(), errorCode.getMessage(), ex);
        if (response.isCommitted()) {
            log.warn("Response already committed. Cannot send error response body for AppException: {}", errorCode.getMessage());
            return ResponseEntity.status(errorCode.getStatusCode()).build();
        }
        return ResponseEntity.status(errorCode.getStatusCode()).body(new ApiResponse<>(errorCode.getCode(), errorCode.getMessage()));
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex, HttpServletResponse response) {
        log.warn("MethodArgumentNotValidException occurred: {}", ex.getMessage());
        if (response.isCommitted()) {
            log.warn("Response already committed. Cannot send error response body for MethodArgumentNotValidException.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        List<Map<String, String>> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> Map.of("field", error.getField(), "message", error.getDefaultMessage()))
                .toList();
        ApiResponse<?> apiResponse = ApiResponse.builder().message("Validation failed").result(errors).build();
        return ResponseEntity.badRequest().body(apiResponse);
    }
}
