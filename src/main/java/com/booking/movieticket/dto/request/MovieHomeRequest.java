package com.booking.movieticket.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MovieHomeRequest {
    private Long movieId;

    private LocalDate date;

    private Long cinemaId;
}
