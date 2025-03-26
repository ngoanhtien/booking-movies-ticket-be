package com.booking.movieticket.configuration.security.jwt;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * Object to return as body in JWT Authentication.
 */
@Getter
@Setter
@AllArgsConstructor
public class JWTToken {
    private String accessToken;
}
