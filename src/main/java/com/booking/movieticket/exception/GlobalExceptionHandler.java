package com.booking.movieticket.exception;

import com.booking.movieticket.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    
    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse<?>> handlingException() {
        return ResponseEntity.internalServerError().body(new ApiResponse<>(ErrorCode.EXCEPTION.getCode(), ErrorCode.EXCEPTION.getMessage()));
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<?>> handlingAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        return ResponseEntity.status(errorCode.getStatusCode()).body(new ApiResponse<>(errorCode.getCode(), errorCode.getMessage()));
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ApiResponse<?>> handleMethodArgumentNotValidException(MethodArgumentNotValidException exception) {
        log.error("MethodArgumentNotValidException caught: ", exception);

        FieldError firstError = exception.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);

        String message = (firstError != null) ? firstError.getDefaultMessage() : "Invalid request";

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .message(message)
                .build();

        return ResponseEntity.badRequest().body(apiResponse);
    }
}
