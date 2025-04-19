package com.booking.movieticket.security.jwt;

import com.booking.movieticket.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.annotation.WebFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class ExceptionHandlingFilter implements Filter {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void doFilter(
            jakarta.servlet.ServletRequest request,
            jakarta.servlet.ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {
        try {
            chain.doFilter(request, response);
        } catch (JwtAuthenticationException ex) {
            handleException((HttpServletResponse) response, HttpStatus.UNAUTHORIZED, "Unauthorized: " + ex.getMessage());
        } catch (AuthenticationException ex) {
            handleException((HttpServletResponse) response, HttpStatus.UNAUTHORIZED, "Unauthorized: " + ex.getMessage());
        } catch (AccessDeniedException ex) {
            handleException((HttpServletResponse) response, HttpStatus.FORBIDDEN, "Forbidden: " + ex.getMessage());
        } catch (Exception ex) {
            handleException((HttpServletResponse) response, HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error: " + ex.getMessage());
        }
    }

    private void handleException(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        ApiResponse<Object> apiResponse = new ApiResponse<>(status.value(), message);
        objectMapper.writeValue(response.getWriter(), apiResponse);
    }

    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void destroy() {
    }
}
