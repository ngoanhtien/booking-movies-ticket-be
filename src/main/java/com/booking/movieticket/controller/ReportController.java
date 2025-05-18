package com.booking.movieticket.controller;

import com.booking.movieticket.dto.report.SalesReportDTO;
import com.booking.movieticket.dto.report.AttendanceReportDTO;
import com.booking.movieticket.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/sales")
    public ResponseEntity<List<SalesReportDTO>> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "daily") String type) {
        return ResponseEntity.ok(reportService.getSalesReport(startDate, endDate, type));
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<AttendanceReportDTO>> getAttendanceReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "daily") String type) {
        return ResponseEntity.ok(reportService.getAttendanceReport(startDate, endDate, type));
    }

    @GetMapping("/sales/export")
    public ResponseEntity<byte[]> exportSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "daily") String type) {
        byte[] reportData = reportService.exportSalesReport(startDate, endDate, type);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", 
            String.format("sales-report-%s.xlsx", LocalDate.now()));

        return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
    }

    @GetMapping("/attendance/export")
    public ResponseEntity<byte[]> exportAttendanceReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "daily") String type) {
        byte[] reportData = reportService.exportAttendanceReport(startDate, endDate, type);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", 
            String.format("attendance-report-%s.xlsx", LocalDate.now()));

        return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
    }
} 