package com.booking.movieticket.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Enumeration;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DebuggingController {

    @PostMapping("/api/v1/bookings/**")
    public ResponseEntity<?> debugApiV1BookingsPostRequests(@RequestBody(required = false) Map<String, Object> payload, HttpServletRequest request) {
        log.info("============== DEBUG CONTROLLER /api/v1/bookings/** ==============");
        logRequestDetails(request, payload);
        return ResponseEntity.ok(Map.of("message", "Debug endpoint caught request"));
    }

    @PostMapping("/api/v1/booking/**")
    public ResponseEntity<?> debugApiV1BookingPostRequests(@RequestBody(required = false) Map<String, Object> payload, HttpServletRequest request) {
        log.info("============== DEBUG CONTROLLER /api/v1/booking/** ==============");
        logRequestDetails(request, payload);
        return ResponseEntity.ok(Map.of("message", "Debug endpoint caught request"));
    }

    @PostMapping("/bookings/**")
    public ResponseEntity<?> debugBookingsPostRequests(@RequestBody(required = false) Map<String, Object> payload, HttpServletRequest request) {
        log.info("============== DEBUG CONTROLLER /bookings/** ==============");
        logRequestDetails(request, payload);
        return ResponseEntity.ok(Map.of("message", "Debug endpoint caught request"));
    }

    @PostMapping("/booking/**")
    public ResponseEntity<?> debugBookingPostRequests(@RequestBody(required = false) Map<String, Object> payload, HttpServletRequest request) {
        log.info("============== DEBUG CONTROLLER /booking/** ==============");
        logRequestDetails(request, payload);
        return ResponseEntity.ok(Map.of("message", "Debug endpoint caught request"));
    }

    private void logRequestDetails(HttpServletRequest request, Map<String, Object> payload) {
        log.info("Request URI: {}", request.getRequestURI());
        log.info("Request URL: {}", request.getRequestURL());
        log.info("Method: {}", request.getMethod());
        
        log.info("Headers:");
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            log.info("  {}: {}", headerName, request.getHeader(headerName));
        }

        log.info("Parameters:");
        Map<String, String[]> parameterMap = request.getParameterMap();
        for (String paramName : parameterMap.keySet()) {
            String[] paramValues = parameterMap.get(paramName);
            StringBuilder values = new StringBuilder();
            for (String value : paramValues) {
                values.append(value).append(", ");
            }
            log.info("  {}: {}", paramName, values.toString());
        }

        // Log request body
        if (payload != null) {
            log.info("Request Body: {}", payload);
        } else {
            log.info("Request Body: Empty or could not be parsed");
        }
    }
} 