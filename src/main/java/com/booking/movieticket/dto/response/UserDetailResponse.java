package com.booking.movieticket.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String role; // e.g., "USER", "ADMIN"
    // Add other fields if needed by the frontend, for example:
    // private String avatarUrl;
    // private MembershipLevel membershipLevel;
} 