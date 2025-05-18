package com.booking.movieticket.dto.request.admin.create;

import com.booking.movieticket.entity.enums.RoomStatus;
import com.booking.movieticket.entity.enums.RoomType;
import com.booking.movieticket.entity.enums.ScreenSize;
import jakarta.validation.constraints.*;
import lombok.Getter;

@Getter
public class RoomInformationRequest {

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

    private Integer seatRowNumbers;
    private Integer seatColumnNumbers;
    private Integer aislePosition;
    private Integer aisleWidth;
    private Integer aisleHeight;
    @NotNull(message = "Branch ID must not be blank.")
    private Long branchId;
}