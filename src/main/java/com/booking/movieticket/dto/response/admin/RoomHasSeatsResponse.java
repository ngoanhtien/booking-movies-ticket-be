package com.booking.movieticket.dto.response.admin;

import com.booking.movieticket.dto.response.admin.create.RoomDetailResponse;
import com.booking.movieticket.entity.Seat;

import java.util.HashSet;
import java.util.Set;

public class RoomHasSeatsResponse extends RoomDetailResponse {
    public Set<Seat> seats = new HashSet<>();
}
