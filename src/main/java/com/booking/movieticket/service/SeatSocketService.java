package com.booking.movieticket.service;

import com.booking.movieticket.dto.request.SeatReservationRequest;
import com.booking.movieticket.dto.response.SeatReservationResponse;

public interface SeatSocketService {
    SeatReservationResponse sendSeatReservationResponse(SeatReservationRequest request,
                                                        Long roomId,
                                                        Long scheduleId);
}
