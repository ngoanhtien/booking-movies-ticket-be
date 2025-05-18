package com.booking.movieticket.mapper;

import com.booking.movieticket.dto.request.admin.create.RoomHasSeatsRequest;
import com.booking.movieticket.dto.request.admin.create.RoomInformationRequest;
import com.booking.movieticket.dto.request.admin.update.RoomForUpdateRequest;
import com.booking.movieticket.dto.response.admin.RoomHasSeatsResponse;
import com.booking.movieticket.dto.response.admin.RoomInformationResponse;
import com.booking.movieticket.dto.response.admin.create.RoomNotCompletedCreatedResponse;
import com.booking.movieticket.entity.Branch;
import com.booking.movieticket.entity.Room;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.repository.BranchRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class RoomMapper {

    @Autowired
    BranchRepository branchRepository;

    @Mapping(target = "branch", expression = "java(getBranchFromId(request.getBranchId()))")
    @Mapping(target = "roomStatus", expression = "java(com.booking.movieticket.entity.enums.RoomStatus.UNASSIGNED)")
    public abstract Room convertNotCompletedRequestToRoom(RoomInformationRequest request);

    @Mapping(target = "branch", expression = "java(getBranchFromId(request.getBranchId()))")
    @Mapping(target = "roomStatus", expression = "java(com.booking.movieticket.entity.enums.RoomStatus.AVAILABLE)")
    public abstract Room convertCompletedRequestToRoom(RoomHasSeatsRequest request);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "seatNumbers", target = "seatNumbers")
    @Mapping(source = "screenSize", target = "screenSize")
    @Mapping(source = "roomType", target = "roomType")
    @Mapping(source = "roomStatus", target = "roomStatus")
    @Mapping(source = "seatRowNumbers", target = "seatRowNumbers")
    @Mapping(source = "seatColumnNumbers", target = "seatColumnNumbers")
    @Mapping(source = "aislePosition", target = "aislePosition")
    @Mapping(source = "aisleWidth", target = "aisleWidth")
    @Mapping(source = "aisleHeight", target = "aisleHeight")
    @Mapping(source = "branch.id", target = "branchId")
    @Mapping(source = "branch.name", target = "branchName")
    @Mapping(source = "seats", target = "seats")
    public abstract RoomHasSeatsResponse convertEntityToRoomHasSeatsResponse(Room room);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "seatNumbers", target = "seatNumbers")
    @Mapping(source = "screenSize", target = "screenSize")
    @Mapping(source = "roomType", target = "roomType")
    @Mapping(source = "roomStatus", target = "roomStatus")
    @Mapping(source = "seatRowNumbers", target = "seatRowNumbers")
    @Mapping(source = "seatColumnNumbers", target = "seatColumnNumbers")
    @Mapping(source = "aislePosition", target = "aislePosition")
    @Mapping(source = "aisleWidth", target = "aisleWidth")
    @Mapping(source = "aisleHeight", target = "aisleHeight")
    @Mapping(source = "branch.id", target = "branchId")
    @Mapping(source = "branch.name", target = "branchName")
    public abstract RoomInformationResponse convertEntityToRoomInformationResponse(Room room);

    @Mapping(source = "branch.id", target = "branchId")
    @Mapping(source = "branch.name", target = "branchName")
    public abstract RoomNotCompletedCreatedResponse convertEntityToRoomNotCompletedCreatedResponse(Room room);

    public abstract void updateRoomFromRequest(RoomForUpdateRequest request, @MappingTarget Room room);

    protected Branch getBranchFromId(Long branchId) {
        if (branchId == null) {
            return null;
        }
        return branchRepository.findById(branchId).orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOT_FOUND));
    }
}
