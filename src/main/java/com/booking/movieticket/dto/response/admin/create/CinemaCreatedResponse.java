package com.booking.movieticket.dto.response.admin.create;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CinemaCreatedResponse {

    private Long id;
    private String name;
    private String hotline;
    private String description;
}
