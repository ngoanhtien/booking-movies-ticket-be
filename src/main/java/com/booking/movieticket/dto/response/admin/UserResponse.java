package com.booking.movieticket.dto.response.admin;

import com.booking.movieticket.dto.response.BaseResponse;
import com.booking.movieticket.entity.enums.MembershipLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse extends BaseResponse {

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
