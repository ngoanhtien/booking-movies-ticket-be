package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.report.SalesReportDTO;
import com.booking.movieticket.dto.report.AttendanceReportDTO;
import com.booking.movieticket.service.ReportService;
import com.booking.movieticket.repository.BookingRepository;
import com.booking.movieticket.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "salesReports", key = "#startDate.toString() + '-' + #endDate.toString() + '-' + #type")
    public List<SalesReportDTO> getSalesReport(LocalDate startDate, LocalDate endDate, String type) {
        return bookingRepository.findSalesReport(startDate, endDate, type)
                .stream()
                .map(booking -> {
                    SalesReportDTO dto = new SalesReportDTO();
                    dto.setMovieName(booking.getShowtime().getMovie().getName());
                    dto.setFormat(booking.getShowtime().getFormat());
                    dto.setDate(booking.getShowtime().getDate());
                    dto.setRevenue(BigDecimal.valueOf(booking.getTotalAmount()));
                    dto.setTickets(booking.getShowtimeSeats().size());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "attendanceReports", key = "#startDate.toString() + '-' + #endDate.toString() + '-' + #type")
    public List<AttendanceReportDTO> getAttendanceReport(LocalDate startDate, LocalDate endDate, String type) {
        return showtimeRepository.findAttendanceReport(startDate, endDate, type)
                .stream()
                .map(showtime -> {
                    AttendanceReportDTO dto = new AttendanceReportDTO();
                    dto.setMovieName(showtime.getMovie().getName());
                    dto.setCinemaName(showtime.getRoom().getBranch().getName());
                    dto.setDate(showtime.getDate());
                    dto.setAttendance(showtime.getShowtimeSeats().size());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Scheduled(cron = "0 0 * * * *") // Clear cache every hour
    @CacheEvict(value = {"salesReports", "attendanceReports"}, allEntries = true)
    public void clearReportCache() {
        // Cache will be cleared automatically
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportSalesReport(LocalDate startDate, LocalDate endDate, String type) {
        List<SalesReportDTO> salesData = getSalesReport(startDate, endDate, type);
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Sales Report");
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Movie", "Format", "Date", "Revenue", "Tickets"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            // Create data rows
            int rowNum = 1;
            for (SalesReportDTO data : salesData) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(data.getMovieName());
                row.createCell(1).setCellValue(data.getFormat());
                row.createCell(2).setCellValue(data.getDate().format(DATE_FORMATTER));
                row.createCell(3).setCellValue(data.getRevenue().doubleValue());
                row.createCell(4).setCellValue(data.getTickets());
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating sales report", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportAttendanceReport(LocalDate startDate, LocalDate endDate, String type) {
        List<AttendanceReportDTO> attendanceData = getAttendanceReport(startDate, endDate, type);
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Attendance Report");
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Movie", "Cinema", "Date", "Attendance"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            // Create data rows
            int rowNum = 1;
            for (AttendanceReportDTO data : attendanceData) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(data.getMovieName());
                row.createCell(1).setCellValue(data.getCinemaName());
                row.createCell(2).setCellValue(data.getDate().format(DATE_FORMATTER));
                row.createCell(3).setCellValue(data.getAttendance());
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating attendance report", e);
        }
    }
} 