package com.booking.movieticket.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeDTO {
    private Long scheduleId;
    private Long roomId;
    private String roomName;
    private String roomType;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate scheduleDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime scheduleTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime scheduleEndTime;
}