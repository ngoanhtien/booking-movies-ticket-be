package com.booking.movieticket.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    private Long scheduleId;
    private Long roomId;
    private List<Long> seatIds;
    private List<FoodOrderItem> foodItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FoodOrderItem {
        private Long foodId;
        private Integer quantity;
    }
}