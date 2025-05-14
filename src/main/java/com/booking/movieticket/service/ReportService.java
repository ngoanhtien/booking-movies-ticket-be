package com.booking.movieticket.service;

import com.booking.movieticket.dto.report.SalesReportDTO;
import com.booking.movieticket.dto.report.AttendanceReportDTO;
import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    List<SalesReportDTO> getSalesReport(LocalDate startDate, LocalDate endDate, String type);
    List<AttendanceReportDTO> getAttendanceReport(LocalDate startDate, LocalDate endDate, String type);
    byte[] exportSalesReport(LocalDate startDate, LocalDate endDate, String type);
    byte[] exportAttendanceReport(LocalDate startDate, LocalDate endDate, String type);
} 