package com.booking.movieticket.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Base64;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Component
@Slf4j
public class TokenProvider {

    private static final String AUTHORITIES_KEY = "auth";

    private static final String USER_ID_KEY = "userId";

    @Value("${security.jwt.secret}")
    String tokenSecretKey;

    @Value("${security.jwt.token-validity-in-seconds}")
    Long tokenValidityInSeconds;

    long tokenValidityInMilliseconds;

    @Value("${security.jwt.token-refresh-in-seconds}")
    Long tokenRefreshInSeconds;

    @PostConstruct
    protected void init() {
        this.tokenSecretKey = Base64.getEncoder().encodeToString(tokenSecretKey.getBytes());
        this.tokenValidityInMilliseconds = 1000 * tokenValidityInSeconds;
        this.tokenRefreshInSeconds = 1000 * tokenRefreshInSeconds;
    }

    public String createToken(Authentication authentication) {
        String authorities = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(","));
        Claims claims = Jwts.claims().setSubject(authentication.getName());
        claims.put(AUTHORITIES_KEY, authorities);
        //todo put another claims
        Long userId = ((DomainUserDetails) authentication.getPrincipal()).getUserId();
        claims.put(USER_ID_KEY, userId);
        Date now = new Date();
        Date validity = new Date(now.getTime() + tokenValidityInMilliseconds);
        return Jwts.builder().setClaims(claims).setIssuedAt(now).setExpiration(validity).signWith(SignatureAlgorithm.HS512, tokenSecretKey).compact();
    }

    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parser().setSigningKey(tokenSecretKey).parseClaimsJws(token).getBody();

        Collection<? extends GrantedAuthority> authorities = Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
                .filter(auth -> !auth.trim().isEmpty()).map(SimpleGrantedAuthority::new).toList();
        Long userId = Long.valueOf(claims.get(USER_ID_KEY).toString());
        UserDetails principal = new DomainUserDetails(userId, claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(tokenSecretKey).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            log.error("Token validation error {}", e.getMessage());
        }
        return false;
    }

    public String generateRefreshToken(Authentication authentication) {
        log.info("Generating refresh token for user: {}", authentication.getName());
        String authorities = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(","));
        Claims claims = Jwts.claims().setSubject(authentication.getName());
        claims.put(AUTHORITIES_KEY, authorities);
        //todo put another claims
        Long userId = ((DomainUserDetails) authentication.getPrincipal()).getUserId();
        claims.put(USER_ID_KEY, userId);
        Date now = new Date();
        Date validity = new Date(now.getTime() + tokenRefreshInSeconds);
        log.info("Refresh token will expire at: {}", validity);
        return Jwts.builder().setClaims(claims).setIssuedAt(now).setExpiration(validity).signWith(SignatureAlgorithm.HS512, tokenSecretKey).compact();
    }

    public String getUsernameFromRefreshToken(String token) {
        try {
            log.info("Extracting username from refresh token");
            Claims claims = Jwts.parser().setSigningKey(tokenSecretKey).parseClaimsJws(token).getBody();
            String username = claims.getSubject();
            log.info("Username extracted: {}", username);
            return username;
        } catch (Exception e) {
            log.error("Error extracting username from refresh token: {}", e.getMessage(), e);
            return null;
        }
    }

}