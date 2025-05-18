package com.booking.movieticket.dto.request.admin.update;

import com.booking.movieticket.entity.enums.RoomType;
import com.booking.movieticket.entity.enums.ScreenSize;
import jakarta.validation.constraints.*;
import lombok.Getter;

@Getter
public class RoomForUpdateRequest {

    private Long id;

    @NotBlank(message = "Room name must not be blank.")
    @Size(min = 2, max = 100, message = "Room name must be between 2 and 100 characters.")
    private String name;

    @NotNull(message = "Seat numbers must not be null.")
    @Min(value = 1, message = "Seat numbers must be at least 1.")
    @Max(value = 1000, message = "Seat numbers must not exceed 1000.")
    private Integer seatNumbers;

    @NotNull(message = "Screen size must not be null.")
    private ScreenSize screenSize;

    @NotNull(message = "Room type must not be null.")
    private RoomType roomType;
}
