package com.booking.movieticket.dto.request.admin.create;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class ShowtimeForCreateRequest {
    Long movieId;
    Long roomId;
    LocalTime startTime;
    String format;
}
