package com.booking.movieticket.dto.report;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceReportDTO {
    private String movieName;
    private String cinemaName;
    private LocalDate date;
    private Integer attendance;
} 