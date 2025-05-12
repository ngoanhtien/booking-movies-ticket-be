package com.booking.movieticket.dto.request.admin.create;

import com.booking.movieticket.entity.enums.TypeSeat;
import lombok.Getter;

@Getter
public class CustomSeatDTO {
    private String row;
    private String column;
    private TypeSeat typeSeat;
}
