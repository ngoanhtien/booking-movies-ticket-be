package com.booking.movieticket.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Filters incoming requests and installs a Spring Security principal if a header corresponding to a valid user is
 * found.
 */
@Component
public class AuthenticationFilter extends OncePerRequestFilter {

    public static final String AUTHORIZATION_HEADER = "Authorization";

    private final TokenProvider tokenProvider;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private final List<String> publicPaths = Arrays.asList(
            "/auth/login",
            "/auth/register",
            "/auth/refresh-token",
            "/auth/refresh",
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/refresh-token",
            "/api/v1/auth/refresh",
            "/api/v1/account/resetPassword",
            "/api/v1/payment/sepay-webhook",
            "/api/v1/payment/**",
            "/api/v1/bookings/**",
            "/api/v1/booking/**",
            "/api/v1/foods/**",
            "/api/v1/movie/**",
            "/api/v1/cinema/**",
            "/api/v1/showtime/*/by-date",
            "/api/v1/showtime/*/filter",
            "/api/v1/showtime/*/*/detail",
            "/api/v1/showtime/public/**"
    );

    public AuthenticationFilter(TokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    public void doFilterInternal(HttpServletRequest httpServletRequest,
                                 HttpServletResponse httpServletResponse,
                                 FilterChain filterChain) throws IOException, ServletException {
        String requestURI = httpServletRequest.getRequestURI();

        for (String path : publicPaths) {
            if (pathMatcher.match(path, requestURI)) {
                filterChain.doFilter(httpServletRequest, httpServletResponse);
                return;
            }
        }

        String jwt = resolveToken(httpServletRequest);
        if (StringUtils.hasText(jwt) && this.tokenProvider.validateToken(jwt)) {
            Authentication authentication = this.tokenProvider.getAuthentication(jwt);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(httpServletRequest, httpServletResponse);
        } else {
            throw new JwtAuthenticationException("Token is not valid.");
        }
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}