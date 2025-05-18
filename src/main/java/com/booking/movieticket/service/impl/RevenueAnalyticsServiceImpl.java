package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.response.RevenueByCategoryDTO;
import com.booking.movieticket.dto.response.RevenueByCategoryDTO.CategoryRevenuePoint;
import com.booking.movieticket.dto.response.RevenueSummaryDTO;
import com.booking.movieticket.dto.response.RevenueTimeSeriesDTO;
import com.booking.movieticket.dto.response.RevenueTimeSeriesDTO.DateRevenuePoint;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.service.RevenueAnalyticsService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RevenueAnalyticsServiceImpl implements RevenueAnalyticsService {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public RevenueTimeSeriesDTO getDailyRevenue(LocalDate startDate, LocalDate endDate) {
        try {
            String sql = """
                    SELECT
                        DATE(s.schedule_date) as date,
                        SUM(ss.price) as revenue,
                        COUNT(bd.id) as ticket_count
                    FROM
                        bill b
                    JOIN
                        bill_detail bd ON b.bill_id = bd.bill_id
                    JOIN
                        showtime_seat ss ON bd.showtime_seat_id = ss.showtime_seat_id
                    JOIN
                        showtimes st ON ss.schedule_id = st.schedule_id AND ss.room_id = st.room_id
                    JOIN
                        schedules s ON st.schedule_id = s.schedule_id
                    WHERE
                        b.status_bill = 'PAID'
                        AND b.is_deleted = false
                        AND s.schedule_date BETWEEN :startDate AND :endDate
                    GROUP BY
                        DATE(s.schedule_date)
                    ORDER BY
                        date
                """;

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("startDate", startDate);
            query.setParameter("endDate", endDate);

            List<Object[]> results = query.getResultList();
            List<DateRevenuePoint> dataPoints = new ArrayList<>();

            for (Object[] row : results) {
                DateRevenuePoint point = DateRevenuePoint.builder()
                        .date(((java.sql.Date) row[0]).toLocalDate())
                        .revenue(((Number) row[1]).doubleValue())
                        .ticketCount(((Number) row[2]).intValue())
                        .build();
                dataPoints.add(point);
            }

            return RevenueTimeSeriesDTO.builder()
                    .dataPoints(dataPoints)
                    .build();
        } catch (Exception e) {
            log.error("Error getting daily revenue: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Error getting daily revenue statistics");
        }
    }

    @Override
    public RevenueByCategoryDTO getRevenueByMovie(LocalDate startDate, LocalDate endDate, Integer limit) {
        try {
            String sql = """
                        SELECT
                            m.movie_name as category_name,
                            m.movie_id as category_id,
                            SUM(ss.price) as revenue,
                            COUNT(bd.id) as ticket_count
                        FROM
                            bill b
                        JOIN
                            bill_detail bd ON b.bill_id = bd.bill_id
                        JOIN
                            showtime_seat ss ON bd.showtime_seat_id = ss.showtime_seat_id
                        JOIN
                            showtimes st ON ss.schedule_id = st.schedule_id AND ss.room_id = st.room_id
                        JOIN
                            schedules s ON st.schedule_id = s.schedule_id
                        JOIN
                            movies m ON s.movie_id = m.movie_id
                        WHERE
                            b.status_bill = 'PAID'
                            AND b.is_deleted = false
                            AND s.schedule_date BETWEEN :startDate AND :endDate
                        GROUP BY
                            m.movie_id, m.movie_name
                        ORDER BY
                            revenue DESC
                    """;

            if (limit != null && limit > 0) {
                sql += " LIMIT " + limit;
            }

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("startDate", startDate);
            query.setParameter("endDate", endDate);

            List<Object[]> results = query.getResultList();

            // Calculate total revenue for percentage
            double totalRevenue = results.stream()
                    .mapToDouble(row -> ((Number) row[2]).doubleValue())
                    .sum();

            List<CategoryRevenuePoint> dataPoints = new ArrayList<>();

            for (Object[] row : results) {
                double revenue = ((Number) row[2]).doubleValue();
                double percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

                CategoryRevenuePoint point = CategoryRevenuePoint.builder()
                        .categoryName((String) row[0])
                        .categoryId(((Number) row[1]).longValue())
                        .revenue(revenue)
                        .ticketCount(((Number) row[3]).intValue())
                        .percentage(Math.round(percentage * 100.0) / 100.0) // Round to 2 decimal places
                        .build();
                dataPoints.add(point);
            }

            return RevenueByCategoryDTO.builder()
                    .dataPoints(dataPoints)
                    .build();
        } catch (Exception e) {
            log.error("Error getting revenue by movie: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Error getting revenue by movie statistics");
        }
    }

    @Override
    public RevenueByCategoryDTO getRevenueByCinema(LocalDate startDate, LocalDate endDate) {
        try {
            String sql = """
                        SELECT
                            c.cinema_name as category_name,
                            c.cinema_id as category_id,
                            SUM(ss.price) as revenue,
                            COUNT(bd.id) as ticket_count
                        FROM
                            bill b
                        JOIN
                            bill_detail bd ON b.bill_id = bd.bill_id
                        JOIN
                            showtime_seat ss ON bd.showtime_seat_id = ss.showtime_seat_id
                        JOIN
                            showtimes st ON ss.schedule_id = st.schedule_id AND ss.room_id = st.room_id
                        JOIN
                            schedules s ON st.schedule_id = s.schedule_id
                        JOIN
                            rooms r ON st.room_id = r.room_id
                        JOIN
                            branchs br ON r.branch_id = br.branch_id
                        JOIN
                            cinemas c ON br.cinema_id = c.cinema_id
                        WHERE
                            b.status_bill = 'PAID'
                            AND b.is_deleted = false
                            AND s.schedule_date BETWEEN ::startDate AND ::endDate
                        GROUP BY
                            c.cinema_id, c.cinema_name
                        ORDER BY
                            revenue DESC
                    """;

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("startDate", startDate);
            query.setParameter("endDate", endDate);

            List<Object[]> results = query.getResultList();

            // Calculate total revenue for percentage
            double totalRevenue = results.stream()
                    .mapToDouble(row -> ((Number) row[2]).doubleValue())
                    .sum();

            List<CategoryRevenuePoint> dataPoints = new ArrayList<>();

            for (Object[] row : results) {
                double revenue = ((Number) row[2]).doubleValue();
                double percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

                CategoryRevenuePoint point = CategoryRevenuePoint.builder()
                        .categoryName((String) row[0])
                        .categoryId(((Number) row[1]).longValue())
                        .revenue(revenue)
                        .ticketCount(((Number) row[3]).intValue())
                        .percentage(Math.round(percentage * 100.0) / 100.0)
                        .build();
                dataPoints.add(point);
            }

            return RevenueByCategoryDTO.builder()
                    .dataPoints(dataPoints)
                    .build();
        } catch (Exception e) {
            log.error("Error getting revenue by cinema: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Error getting revenue by cinema statistics");
        }
    }

    @Override
    public RevenueByCategoryDTO getRevenueByShowtime(LocalDate startDate, LocalDate endDate) {
        try {
            String sql = """
                        SELECT
                            CONCAT(CAST(EXTRACT(HOUR FROM s.schedule_time_start) AS VARCHAR), ':00') as category_name,
                            EXTRACT(HOUR FROM s.schedule_time_start) as category_id,
                            SUM(ss.price) as revenue,
                            COUNT(bd.id) as ticket_count
                        FROM
                            bill b
                        JOIN
                            bill_detail bd ON b.bill_id = bd.bill_id
                        JOIN
                            showtime_seat ss ON bd.showtime_seat_id = ss.showtime_seat_id
                        JOIN
                            showtimes st ON ss.schedule_id = st.schedule_id AND ss.room_id = st.room_id
                        JOIN
                            schedules s ON st.schedule_id = s.schedule_id
                        WHERE
                            b.status_bill = 'PAID'
                            AND b.is_deleted = false
                            AND s.schedule_date BETWEEN :startDate AND :endDate
                        GROUP BY
                            EXTRACT(HOUR FROM s.schedule_time_start)
                        ORDER BY
                            category_id
                    """;

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("startDate", startDate);
            query.setParameter("endDate", endDate);

            List<Object[]> results = query.getResultList();

            // Calculate total revenue for percentage
            double totalRevenue = results.stream()
                    .mapToDouble(row -> ((Number) row[2]).doubleValue())
                    .sum();

            List<CategoryRevenuePoint> dataPoints = new ArrayList<>();

            for (Object[] row : results) {
                double revenue = ((Number) row[2]).doubleValue();
                double percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

                CategoryRevenuePoint point = CategoryRevenuePoint.builder()
                        .categoryName((String) row[0])
                        .categoryId(((Number) row[1]).longValue())
                        .revenue(revenue)
                        .ticketCount(((Number) row[3]).intValue())
                        .percentage(Math.round(percentage * 100.0) / 100.0)
                        .build();
                dataPoints.add(point);
            }

            return RevenueByCategoryDTO.builder()
                    .dataPoints(dataPoints)
                    .build();
        } catch (Exception e) {
            log.error("Error getting revenue by showtime: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Error getting revenue by showtimes statistics");
        }
    }

    @Override
    public RevenueByCategoryDTO getRevenueByTicketType(LocalDate startDate, LocalDate endDate) {
        try {
            String sql = """
                        SELECT
                            se.type_seat as category_name,
                            se.type_seat as category_id, 
                            SUM(ss.price) as revenue,
                            COUNT(bd.id) as ticket_count
                        FROM
                            bill b
                        JOIN
                            bill_detail bd ON b.bill_id = bd.bill_id
                        JOIN
                            showtime_seat ss ON bd.showtime_seat_id = ss.showtime_seat_id
                        JOIN
                            seats se ON ss.seat_id = se.seat_id
                        JOIN
                            showtimes st ON ss.schedule_id = st.schedule_id AND ss.room_id = st.room_id
                        JOIN
                            schedules s ON st.schedule_id = s.schedule_id
                        WHERE
                            b.status_bill = 'PAID'
                            AND b.is_deleted = false
                            AND s.schedule_date BETWEEN :startDate AND :endDate
                        GROUP BY
                            se.type_seat
                        ORDER BY
                            revenue DESC
                    """;

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("startDate", startDate);
            query.setParameter("endDate", endDate);

            List<Object[]> results = query.getResultList();

            // Calculate total revenue for percentage
            double totalRevenue = results.stream()
                    .mapToDouble(row -> ((Number) row[2]).doubleValue())
                    .sum();

            List<CategoryRevenuePoint> dataPoints = new ArrayList<>();

            for (Object[] row : results) {
                double revenue = ((Number) row[2]).doubleValue();
                double percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

                CategoryRevenuePoint point = CategoryRevenuePoint.builder()
                        .categoryName((String) row[0])
                        .categoryId(0L) // We don't have a numeric ID for seat types
                        .revenue(revenue)
                        .ticketCount(((Number) row[3]).intValue())
                        .percentage(Math.round(percentage * 100.0) / 100.0)
                        .build();
                dataPoints.add(point);
            }

            return RevenueByCategoryDTO.builder()
                    .dataPoints(dataPoints)
                    .build();
        } catch (Exception e) {
            log.error("Error getting revenue by ticket type: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Error getting revenue by ticket type statistics");
        }
    }

    @Override
    public RevenueSummaryDTO getRevenueSummary(LocalDate startDate, LocalDate endDate) {
        try {
            String sql = """
                        SELECT
                            SUM(ss.price) as total_revenue,
                            COUNT(bd.id) as total_tickets,
                            COUNT(DISTINCT s.movie_id) as total_movies,
                            COUNT(DISTINCT st.schedule_id) as total_showtimes
                        FROM
                            bill b
                        JOIN
                            bill_detail bd ON b.bill_id = bd.bill_id
                        JOIN
                            showtime_seat ss ON bd.showtime_seat_id = ss.showtime_seat_id
                        JOIN
                            showtimes st ON ss.schedule_id = st.schedule_id AND ss.room_id = st.room_id
                        JOIN
                            schedules s ON st.schedule_id = s.schedule_id
                        WHERE
                            b.status_bill = 'PAID'
                            AND b.is_deleted = false
                            AND s.schedule_date BETWEEN :startDate AND :endDate
                    """;

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("startDate", startDate);
            query.setParameter("endDate", endDate);

            Object[] result = (Object[]) query.getSingleResult();

            return RevenueSummaryDTO.builder()
                    .totalRevenue(result[0] != null ? ((Number) result[0]).doubleValue() : 0.0)
                    .totalTickets(result[1] != null ? ((Number) result[1]).intValue() : 0)
                    .totalMovies(result[2] != null ? ((Number) result[2]).intValue() : 0)
                    .totalShowtimes(result[3] != null ? ((Number) result[3]).intValue() : 0)
                    .startDate(startDate)
                    .endDate(endDate)
                    .build();
        } catch (Exception e) {
            log.error("Error getting revenue summary: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Error getting revenue summary statistics");
        }
    }
}