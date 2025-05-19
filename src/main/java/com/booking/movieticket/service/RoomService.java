package com.booking.movieticket.service;

import com.booking.movieticket.dto.criteria.RoomCriteria;
import com.booking.movieticket.dto.request.admin.create.GenerateSeatsRequest;
import com.booking.movieticket.dto.request.admin.create.RoomHasSeatsRequest;
import com.booking.movieticket.dto.request.admin.create.RoomInformationRequest;
import com.booking.movieticket.dto.request.admin.update.RoomForUpdateRequest;
import com.booking.movieticket.dto.response.admin.create.RoomDetailResponse;
import com.booking.movieticket.dto.response.admin.create.RoomNotCompletedCreatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoomService {

    RoomDetailResponse getRoomById(Long id);

    Page<RoomDetailResponse> getAllRoom(RoomCriteria roomCriteria, Pageable pageable);

    RoomNotCompletedCreatedResponse createNotCompletedRoom(RoomInformationRequest roomRequest);

    void generateSeatsForRoom(GenerateSeatsRequest request);

    void createCompletedRoom(RoomHasSeatsRequest roomRequest);

    void updateRoom(RoomForUpdateRequest roomRequest);

    void activateRoom(Long id);

    void deactivateRoom(Long id);

    void removeRoomHasNoSeats(Long id);

    List<String> getAllActiveRoomByCinemaId(Long cinemaId);
}
