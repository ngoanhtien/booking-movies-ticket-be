package com.booking.movieticket.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@ControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggerController {

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<?> handleNoHandlerFoundException(NoHandlerFoundException ex, HttpServletRequest request) {
        log.info("============== UNHANDLED REQUEST DETECTED ==============");
        log.info("Request method: {}", request.getMethod());
        log.info("Request URI: {}", request.getRequestURI());
        
        // Log request headers
        log.info("Request headers:");
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            log.info("  {}: {}", headerName, request.getHeader(headerName));
        }
        
        // Log request parameters
        log.info("Request parameters:");
        Map<String, String[]> parameterMap = request.getParameterMap();
        for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
            log.info("  {}: {}", entry.getKey(), String.join(", ", entry.getValue()));
        }

        // Return a formatted response
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Endpoint not found");
        response.put("message", "The requested endpoint does not exist");
        response.put("path", request.getRequestURI());
        response.put("method", request.getMethod());
        response.put("status", 404);
        
        return ResponseEntity.status(404).body(response);
    }
} 