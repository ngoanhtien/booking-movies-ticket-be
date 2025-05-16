package com.booking.movieticket.dto.response.admin.create;

import com.booking.movieticket.entity.enums.RoomStatus;
import com.booking.movieticket.entity.enums.RoomType;
import com.booking.movieticket.entity.enums.ScreenSize;

public class RoomNotCompletedCreatedResponse {
    private Long id;
    private String name;
    private Integer seatNumbers;
    private ScreenSize screenSize;
    private RoomType roomType;
    private RoomStatus roomStatus;
    private Integer seatRowNumbers;
    private Integer seatColumnNumbers;
    private Integer aislePosition;
    private Integer aisleWidth;
    private Integer aisleHeight;
    private Integer doubleSeatRowNumbers;
    private Long branchId;
    private String branchName;
}
