package com.booking.movieticket.dto.request.admin.create;

import com.booking.movieticket.entity.enums.MembershipLevel;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserForCreateRequest {

    @NotBlank(message = "Username must not be blank.")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters.")
    private String username;

    @NotBlank(message = "Email must not be blank.")
    @Email(message = "Invalid email format.")
    private String email;

    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    private String fullName;

    @Past(message = "Date of birth must be in the past.")
    private LocalDate dob;

    @NotBlank(message = "Phone number must not be blank.")
    @Pattern(regexp = "^\\+?[0-9. ()-]{7,25}$", message = "Invalid phone number format.")
    private String phone;

    private String signupDevice;

    private MembershipLevel membershipLevel;

    private Long roleId;
}
