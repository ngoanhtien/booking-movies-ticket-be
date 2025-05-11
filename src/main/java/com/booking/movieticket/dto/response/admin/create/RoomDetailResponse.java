package com.booking.movieticket.dto.response.admin.create;

import com.booking.movieticket.dto.response.admin.RoomHasSeatsResponse;
import com.booking.movieticket.dto.response.admin.RoomInformationResponse;
import com.booking.movieticket.entity.enums.RoomStatus;
import com.booking.movieticket.entity.enums.RoomType;
import com.booking.movieticket.entity.enums.ScreenSize;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Setter;

@Setter
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({@JsonSubTypes.Type(value = RoomInformationResponse.class, name = "information"), @JsonSubTypes.Type(value = RoomHasSeatsResponse.class, name = "hasSeats")})
public class RoomDetailResponse {
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
