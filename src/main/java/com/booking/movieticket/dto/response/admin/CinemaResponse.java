package com.booking.movieticket.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CinemaResponse {

    private Long id;
    private String name;
    private String hotline;
    private String description;
}
