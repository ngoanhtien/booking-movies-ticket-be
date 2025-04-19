package com.booking.movieticket.security.jwt;

import com.booking.movieticket.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class ExceptionHandlingFilter extends OncePerRequestFilter {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {
        try {
            chain.doFilter(request, response);
        } catch (AuthenticationException ex) {
            handleException(response, HttpStatus.UNAUTHORIZED, "Unauthorized: " + ex.getMessage());
        } catch (AccessDeniedException ex) {
            handleException(response, HttpStatus.FORBIDDEN, "Forbidden: " + ex.getMessage());
        } catch (Exception ex) {
            handleException(response, HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error: " + ex.getMessage());
        }
    }

    private void handleException(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        ApiResponse<Object> apiResponse = new ApiResponse<>(status.value(), message);
        objectMapper.writeValue(response.getWriter(), apiResponse);
    }
}
