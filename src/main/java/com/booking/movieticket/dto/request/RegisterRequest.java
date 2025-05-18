package com.booking.movieticket.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    @Size(max = 50, message = "Email must be at most 50 characters")
    private String email;

    @NotBlank(message = "Full name cannot be blank")
    @Size(min = 3, max = 100, message = "Full name must be between 3 and 100 characters")
    private String fullName;

    private String role;
}