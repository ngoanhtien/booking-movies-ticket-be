package com.booking.movieticket.dto.request.admin.create;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

@Getter
public class GenerateSeatsCompletedRequest {
    private List<CustomSeatDTO> customSeats;
}
