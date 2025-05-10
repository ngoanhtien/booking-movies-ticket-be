package com.booking.movieticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// For category-based revenue data
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueByCategoryDTO {
    private List<CategoryRevenuePoint> dataPoints;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryRevenuePoint {
        private String categoryName;
        private Long categoryId;
        private Double revenue;
        private Integer ticketCount;
        private Double percentage; // Percentage of total revenue
    }
}
