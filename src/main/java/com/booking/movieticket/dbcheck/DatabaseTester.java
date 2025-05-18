package com.booking.movieticket.dbcheck;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseTester {
    private static final Logger log = LoggerFactory.getLogger(DatabaseTester.class);
    
    @Bean
    public CommandLineRunner checkBookings(JdbcTemplate jdbcTemplate) {
        return args -> {
            log.info("=== CHECKING BOOKINGS IN DATABASE ===");
            // Đếm tổng số booking
            int totalBookings = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM bookings", Integer.class);
            log.info("Total bookings in database: {}", totalBookings);
            
            // Kiểm tra booking của user 352
            int user352Bookings = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM bookings WHERE user_id = 352", Integer.class);
            log.info("Bookings for user ID 352: {}", user352Bookings);
            
            // Hiển thị 5 booking gần nhất (nếu có)
            if (totalBookings > 0) {
                log.info("Latest bookings:");
                jdbcTemplate.query(
                    "SELECT booking_id, booking_code, user_id, booking_time, status, payment_method, payment_status FROM bookings ORDER BY booking_time DESC LIMIT 5",
                    (rs, rowNum) -> {
                        log.info("Booking ID: {}, Code: {}, User ID: {}, Time: {}, Status: {}, Payment: {} ({})",
                            rs.getLong("booking_id"),
                            rs.getString("booking_code"),
                            rs.getLong("user_id"),
                            rs.getTimestamp("booking_time"),
                            rs.getString("status"),
                            rs.getString("payment_method"),
                            rs.getString("payment_status")
                        );
                        return null;
                    }
                );
            }
            
            // Kiểm tra showtime_seat có booking_id khớp không
            log.info("Checking seats with bookings:");
            int linkedSeats = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM showtime_seat WHERE booking_id IS NOT NULL", Integer.class);
            log.info("Total seats linked to bookings: {}", linkedSeats);
            
            log.info("=== DATABASE CHECK COMPLETE ===");
        };
    }
} 