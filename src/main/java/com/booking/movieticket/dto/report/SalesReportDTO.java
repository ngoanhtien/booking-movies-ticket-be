package com.booking.movieticket.dto.report;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SalesReportDTO {
    private String movieName;
    private String format;
    private LocalDate date;
    private BigDecimal revenue;
    private Integer tickets;
} 