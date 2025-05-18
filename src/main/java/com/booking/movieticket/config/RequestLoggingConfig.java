package com.booking.movieticket.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;

@Slf4j
@Configuration
public class RequestLoggingConfig {

    @Bean
    public CommonsRequestLoggingFilter requestLoggingFilter() {
        CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
        filter.setIncludeQueryString(true);
        filter.setIncludePayload(true);
        filter.setMaxPayloadLength(10000);
        filter.setIncludeHeaders(true);
        filter.setBeforeMessagePrefix("REQUEST DATA: ");
        return filter;
    }

    @Bean
    public OncePerRequestFilter requestResponseLoggingFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
                ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
                ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);
                
                long startTime = System.currentTimeMillis();
                
                // Log request details
                log.info("=== [REQUEST] {} {} ===", request.getMethod(), request.getRequestURI());
                log.info("Query: {}", request.getQueryString());
                
                // Log headers
                Enumeration<String> headerNames = request.getHeaderNames();
                while (headerNames.hasMoreElements()) {
                    String headerName = headerNames.nextElement();
                    log.info("Header: {} = {}", headerName, request.getHeader(headerName));
                }
                
                // Continue with filter chain
                filterChain.doFilter(requestWrapper, responseWrapper);
                
                // Calculate request duration
                long duration = System.currentTimeMillis() - startTime;
                
                // Log the request body
                String requestBody = new String(requestWrapper.getContentAsByteArray(), StandardCharsets.UTF_8);
                if (!requestBody.isEmpty()) {
                    log.info("Request Body: {}", requestBody);
                }
                
                // Log response status and timing
                log.info("=== [RESPONSE] {} {} - {} ({} ms) ===", 
                        request.getMethod(), 
                        request.getRequestURI(),
                        responseWrapper.getStatus(),
                        duration);
                
                // Log response body if enabled
                /* 
                String responseBody = new String(responseWrapper.getContentAsByteArray(), StandardCharsets.UTF_8);
                if (!responseBody.isEmpty()) {
                    log.info("Response Body: {}", responseBody);
                }
                */
                
                // Copy content of response wrapper back to original response
                responseWrapper.copyBodyToResponse();
            }
        };
    }
} 