package com.booking.movieticket.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Utility class to check database records directly.
 * Run this app with command line arguments:
 * --check.database=true (to view data)
 * --update.schedules=true (to update is_deleted on schedules)
 * --clear.test.showtimes=YYYY-MM-DD,YYYY-MM-DD (to clear showtimes, showtime_seats, and schedules within the date range)
 * 
 * For example:
 * java -jar your-app.jar --check.database=true
 * java -jar your-app.jar --update.schedules=true
 * java -jar your-app.jar --clear.test.showtimes=2025-05-11,2025-05-12
 */
@Component
public class DatabaseChecker implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        boolean shouldCheckDatabase = false;
        boolean shouldUpdateSchedules = false;
        String clearRange = null;

        for (String arg : args) {
            if (arg.equals("--check.database=true")) {
                shouldCheckDatabase = true;
            } else if (arg.equals("--update.schedules=true")) {
                shouldUpdateSchedules = true;
            } else if (arg.startsWith("--clear.test.showtimes=")) {
                clearRange = arg.substring("--clear.test.showtimes=".length());
            }
        }

        if (clearRange != null) {
            clearTestData(clearRange);
        }

        if (shouldUpdateSchedules) {
            updateSchedulesIsDeleted();
        }
        
        if (shouldCheckDatabase) {
            checkDatabaseContents();
        }
    }

    private void clearTestData(String dateRange) {
        System.out.println("\n========== CLEARING TEST DATA ==========\n");
        try {
            String[] dates = dateRange.split(",");
            if (dates.length != 2) {
                System.out.println("Invalid date range format for --clear.test.showtimes. Expected YYYY-MM-DD,YYYY-MM-DD");
                return;
            }
            LocalDate startDate = LocalDate.parse(dates[0], DATE_FORMATTER);
            LocalDate endDate = LocalDate.parse(dates[1], DATE_FORMATTER);

            System.out.println(String.format("Attempting to delete data from %s to %s", startDate, endDate));

            // 1. Delete from showtime_seat first
            // This will delete showtime_seat records whose corresponding schedule_date is in the range.
            String deleteShowtimeSeatsSQL = "DELETE FROM showtime_seat ss WHERE EXISTS (" +
                                          "SELECT 1 FROM schedules sch WHERE sch.schedule_id = ss.schedule_id AND sch.schedule_date >= ? AND sch.schedule_date <= ?)";
            int seatsDeleted = jdbcTemplate.update(deleteShowtimeSeatsSQL, startDate, endDate);
            System.out.println(String.format("Deleted %d rows from showtime_seat.", seatsDeleted));

            // 2. Delete from showtimes
            // This will delete showtimes whose corresponding schedule_date is in the range.
            String deleteShowtimesSQL = "DELETE FROM showtimes st WHERE EXISTS (" +
                                      "SELECT 1 FROM schedules sch WHERE sch.schedule_id = st.schedule_id AND sch.schedule_date >= ? AND sch.schedule_date <= ?)";
            int showtimesDeleted = jdbcTemplate.update(deleteShowtimesSQL, startDate, endDate);
            System.out.println(String.format("Deleted %d rows from showtimes.", showtimesDeleted));

            // 3. Delete from schedules
            String deleteSchedulesSQL = "DELETE FROM schedules WHERE schedule_date >= ? AND schedule_date <= ?";
            int schedulesDeleted = jdbcTemplate.update(deleteSchedulesSQL, startDate, endDate);
            System.out.println(String.format("Deleted %d rows from schedules.", schedulesDeleted));

        } catch (Exception e) {
            System.err.println("Error clearing test data: " + e.getMessage());
            e.printStackTrace();
        }
        System.out.println("\n========== FINISHED CLEARING TEST DATA ==========\n");
    }

    private void updateSchedulesIsDeleted() {
        System.out.println("\n========== UPDATING SCHEDULES ==========\n");
        String sql = "UPDATE schedules SET is_deleted = false WHERE is_deleted IS NULL";
        int rowsAffected = jdbcTemplate.update(sql);
        System.out.println(String.format("Updated %d schedules to set is_deleted = false where it was NULL.", rowsAffected));
        System.out.println("\n========== FINISHED UPDATING SCHEDULES ==========\n");
    }

    private void checkDatabaseContents() {
        System.out.println("\n========== DATABASE CHECKER ==========\n");
        
        System.out.println("--- Rooms with ID 1 and 3 ---");
        List<Map<String, Object>> rooms = jdbcTemplate.queryForList(
                "SELECT room_id, room_name, branch_id, is_deleted FROM rooms WHERE room_id IN (1, 3)");
        
        if (rooms.isEmpty()) {
            System.out.println("No rooms found with ID 1 or 3");
        } else {
            for (Map<String, Object> room : rooms) {
                System.out.println(String.format("Room ID: %s, Name: %s, Branch ID: %s, Is Deleted: %s",
                        room.get("room_id"), room.get("room_name"), room.get("branch_id"), room.get("is_deleted")));
            }
        }
        
        System.out.println();
        
        System.out.println("--- Branches with ID 1 and 2 ---");
        List<Map<String, Object>> branches = jdbcTemplate.queryForList(
                "SELECT branch_id, branch_name, is_deleted FROM branchs WHERE branch_id IN (1, 2)");
        
        if (branches.isEmpty()) {
            System.out.println("No branches found with ID 1 or 2");
        } else {
            for (Map<String, Object> branch : branches) {
                System.out.println(String.format("Branch ID: %s, Name: %s, Is Deleted: %s",
                        branch.get("branch_id"), branch.get("branch_name"), branch.get("is_deleted")));
            }
        }
        
        System.out.println();
        
        System.out.println("--- Schedules for Movie ID 1 on 2025-05-11 (Focus on is_deleted) ---");
        List<Map<String, Object>> schedules = jdbcTemplate.queryForList(
                "SELECT schedule_id, schedule_date, schedule_time_start, movie_id, is_deleted FROM schedules WHERE movie_id = 1 AND schedule_date = '2025-05-11'");
        
        if (schedules.isEmpty()) {
            System.out.println("No schedules found for movie ID 1 on 2025-05-11");
        } else {
            for (Map<String, Object> schedule : schedules) {
                System.out.println(String.format("Schedule ID: %s, Date: %s, Time: %s, Movie ID: %s, ---> Is Deleted: %s",
                        schedule.get("schedule_id"), schedule.get("schedule_date"), schedule.get("schedule_time_start"), 
                        schedule.get("movie_id"), schedule.get("is_deleted")));
            }
        }
        
        System.out.println();
        
        System.out.println("--- Showtimes for Movie ID 1 on 2025-05-11 ---");
        List<Map<String, Object>> showtimes = jdbcTemplate.queryForList(
                "SELECT st.schedule_id, st.room_id, st.is_deleted, st.format, " +
                "r.room_name, r.branch_id, b.branch_name " +
                "FROM showtimes st " +
                "JOIN schedules s ON st.schedule_id = s.schedule_id " +
                "JOIN rooms r ON st.room_id = r.room_id " +
                "JOIN branchs b ON r.branch_id = b.branch_id " +
                "WHERE s.movie_id = 1 AND s.schedule_date = '2025-05-11'");
        
        if (showtimes.isEmpty()) {
            System.out.println("No showtimes found for movie ID 1 on 2025-05-11");
        } else {
            for (Map<String, Object> showtime : showtimes) {
                System.out.println(String.format("Schedule ID: %s, Room ID: %s, Room Name: %s, Format: %s, " +
                                "Branch ID: %s, Branch Name: %s, Is Deleted: %s",
                        showtime.get("schedule_id"), showtime.get("room_id"), showtime.get("room_name"),
                        showtime.get("format"), showtime.get("branch_id"),
                        showtime.get("branch_name"), showtime.get("is_deleted")));
            }
        }
        
        System.out.println("\n========== END DATABASE CHECKER ==========\n");
    }
} 