package com.booking.movieticket.dto.request;

import com.booking.movieticket.entity.enums.MembershipLevel;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {

    private Long id;

    @NotBlank(message = "Tên người dùng không được để trống.")
    @Size(min = 3, max = 50, message = "Tên người dùng phải từ 3 đến 50 ký tự.")
    private String username;

    @NotBlank(message = "Email không được để trống.")
    @Email(message = "Email không hợp lệ.")
    private String email;

    private String fullName;

    @Past(message = "Ngày sinh phải là một ngày trong quá khứ.")
    private LocalDate dob;

    @NotBlank(message = "Số điện thoại không được để trống.")
    @Pattern(regexp = "^\\+?[0-9. ()-]{7,25}$", message = "Số điện thoại không hợp lệ.")
    private String phone;

    @URL(message = "URL ảnh đại diện không hợp lệ.")
    private String avatarUrl;

    private String signupDevice;

    private MembershipLevel membershipLevel;

    private Boolean isDeleted;

    private Long roleId;
}
