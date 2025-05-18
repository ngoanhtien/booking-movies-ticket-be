package com.booking.movieticket.dto.request;

import com.booking.movieticket.entity.enums.StatusSeat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatReservationRequest {
    private Long seatId;
    private String userId;
    private StatusSeat status;
    private Long timestamp;
} 