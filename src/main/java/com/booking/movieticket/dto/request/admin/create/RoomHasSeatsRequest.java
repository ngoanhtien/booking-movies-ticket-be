package com.booking.movieticket.dto.request.admin.create;

import com.booking.movieticket.dto.contraint.ValidRoomLayout;
import com.booking.movieticket.entity.enums.RoomStatus;
import com.booking.movieticket.entity.enums.RoomType;
import com.booking.movieticket.entity.enums.ScreenSize;
import jakarta.validation.constraints.*;
import lombok.Getter;

@Getter
@ValidRoomLayout
public class RoomHasSeatsRequest {

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

    @NotNull(message = "Seat row numbers must not be null.")
    @Min(value = 1, message = "Seat row numbers must be at least 1.")
    @Max(value = 20, message = "Seat row numbers must not exceed 20.")
    private Integer seatRowNumbers;

    @NotNull(message = "Seat column numbers must not be null.")
    @Min(value = 1, message = "Seat column numbers must be at least 1.")
    @Max(value = 20, message = "Seat column numbers must not exceed 20.")
    private Integer seatColumnNumbers;

    @Min(value = 0, message = "Aisle position must be non-negative.")
    private Integer aislePosition;

    @Min(value = 0, message = "Aisle width must be non-negative.")
    @Max(value = 2, message = "Aisle width must not exceed 2.")
    private Integer aisleWidth;

    @Min(value = 0, message = "Aisle height must be non-negative.")
    private Integer aisleHeight;

    @NotNull(message = "Branch ID must not be blank.")
    private Long branchId;

    GenerateSeatsCompletedRequest generateSeatsCompletedRequest;
}
