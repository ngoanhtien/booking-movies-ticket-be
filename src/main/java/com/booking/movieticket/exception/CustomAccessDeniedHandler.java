package com.booking.movieticket.exception;

import com.booking.movieticket.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        ApiResponse<Object> responseData = new ApiResponse<>(HttpStatus.FORBIDDEN.value(), "Access Denied");

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.writeValue(response.getWriter(), responseData);
        response.getWriter().flush();
    }
}
