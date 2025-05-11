package com.booking.movieticket.dto.request.admin.create;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

@Getter
public class GenerateSeatsRequest {
    @NotNull(message = "Room ID must not be null.")
    @Min(value = 1, message = "Room ID must be at least 1.")
    private Long roomId;

    private List<CustomSeatDTO> customSeats;

    private Boolean overrideExistingSeats = true;
}
