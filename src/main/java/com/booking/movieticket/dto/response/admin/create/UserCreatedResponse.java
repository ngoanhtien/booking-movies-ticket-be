package com.booking.movieticket.dto.response.admin.create;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserCreatedResponse {

    private Long id;
    private String username;
}
