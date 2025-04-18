package com.booking.movieticket.dto.business;

import com.booking.movieticket.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {

    private Long id;

    private String username;

    private String email;

    private String password;

    private String fullName;

    private LocalDate dob;

    private String phone;

    private String avatarUrl;

    private String signupDevice;

    private String membershipLevel;

    private Boolean isDeleted;

    private Role role;
}
