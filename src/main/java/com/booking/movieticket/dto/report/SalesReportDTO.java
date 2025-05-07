package com.booking.movieticket.dto.report;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SalesReportDTO {
    private String movieName;
    private String format;
    private String cinemaName;
    private LocalDate date;
    private LocalTime time;
    private BigDecimal revenue;
    private Integer tickets;
    private String month;
    private String year;
} 