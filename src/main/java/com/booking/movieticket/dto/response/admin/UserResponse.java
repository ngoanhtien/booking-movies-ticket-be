package com.booking.movieticket.dto.response.admin;

import com.booking.movieticket.entity.Role;
import com.booking.movieticket.entity.enums.MembershipLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private LocalDate dob;
    private String phone;
    private String signupDevice;
    private MembershipLevel membershipLevel;
    private String roleName;
}
