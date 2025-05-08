package com.booking.movieticket.dto.request.admin.update;

import com.booking.movieticket.entity.enums.MembershipLevel;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserForUpdateRequest {

    private Long id;

    @NotBlank(message = "Username must not be blank.")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters.")
    private String username;

    private String fullName;

    @Past(message = "Date of birth must be in the past.")
    private LocalDate dob;

    private String signupDevice;

    private MembershipLevel membershipLevel;

    private Long roleId;
}
