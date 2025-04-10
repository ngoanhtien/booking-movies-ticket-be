package com.booking.movieticket.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AuthResponse {
    private String message;
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long userId;
    private String username;
    private String email;
    private String fullname;
    private Set<String> roles;
}