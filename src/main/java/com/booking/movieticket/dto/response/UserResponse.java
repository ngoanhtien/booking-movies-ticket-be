package com.booking.movieticket.dto.response;

import com.booking.movieticket.entity.Role;
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
}
