package com.booking.movieticket.security.jwt;

import com.booking.movieticket.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
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
            log.warn("AuthenticationException caught in filter: {}", ex.getMessage());
            handleException(response, HttpStatus.UNAUTHORIZED, "Unauthorized: " + ex.getMessage(), ex);
        } catch (AccessDeniedException ex) {
            log.warn("AccessDeniedException caught in filter: {}", ex.getMessage());
            handleException(response, HttpStatus.FORBIDDEN, "Forbidden: " + ex.getMessage(), ex);
        } catch (Exception ex) {
            log.error("Generic Exception caught in filter: {}", ex.getMessage(), ex);
            handleException(response, HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error: " + ex.getMessage(), ex);
        }
    }

    private void handleException(HttpServletResponse response, HttpStatus status, String message, Exception ex) throws IOException {
        if (response.isCommitted()) {
            log.warn("Response already committed in ExceptionHandlingFilter. Cannot write error JSON for: {}", ex.getMessage());
            // If response is committed, we might not be able to set status/headers reliably,
            // but we must not write to the body to avoid corruption.
            return;
        }
        response.setStatus(status.value());
        response.setContentType("application/json");
        ApiResponse<Object> apiResponse = new ApiResponse<>(status.value(), message);
        objectMapper.writeValue(response.getWriter(), apiResponse);
    }
}
