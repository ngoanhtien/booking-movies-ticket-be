package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.criteria.RoomCriteria;
import com.booking.movieticket.dto.request.admin.create.CustomSeatDTO;
import com.booking.movieticket.dto.request.admin.create.GenerateSeatsRequest;
import com.booking.movieticket.dto.request.admin.create.RoomHasSeatsRequest;
import com.booking.movieticket.dto.request.admin.create.RoomInformationRequest;
import com.booking.movieticket.dto.request.admin.update.RoomForUpdateRequest;
import com.booking.movieticket.dto.response.admin.create.RoomDetailResponse;
import com.booking.movieticket.dto.response.admin.create.RoomNotCompletedCreatedResponse;
import com.booking.movieticket.entity.Room;
import com.booking.movieticket.entity.Seat;
import com.booking.movieticket.entity.enums.RoomStatus;
import com.booking.movieticket.entity.enums.TypeSeat;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.mapper.RoomMapper;
import com.booking.movieticket.repository.RoomRepository;
import com.booking.movieticket.repository.SeatRepository;
import com.booking.movieticket.repository.specification.RoomSpecificationBuilder;
import com.booking.movieticket.service.RoomService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoomServiceImpl implements RoomService {
    RoomRepository roomRepository;
    SeatRepository seatRepository;
    RoomMapper roomMapper;

    @Override
    public RoomDetailResponse getRoomById(Long id) {
        if (id == null) {
            throw new AppException(ErrorCode.ROOM_NOT_FOUND);
        }
        Room room = roomRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        if (room.getRoomStatus() != RoomStatus.UNASSIGNED) {
            return roomMapper.convertEntityToRoomHasSeatsResponse(room);
        } else {
            return roomMapper.convertEntityToRoomInformationResponse(room);
        }
    }

    @Override
    public Page<RoomDetailResponse> getAllRoomByBranchId(RoomCriteria roomCriteria, Pageable pageable) {
        Page<Room> rooms = roomRepository.findAll(RoomSpecificationBuilder.findByCriteria(roomCriteria), pageable);
        return rooms.map(room -> {
            if (room.getRoomStatus() != RoomStatus.UNASSIGNED) {
                return roomMapper.convertEntityToRoomHasSeatsResponse(room);
            } else {
                return roomMapper.convertEntityToRoomInformationResponse(room);
            }
        });
    }

    @Override
    public RoomNotCompletedCreatedResponse createNotCompletedRoom(RoomInformationRequest roomRequest) {
        Room room = roomMapper.convertNotCompletedRequestToRoom(roomRequest);
        room.setIsDeleted(false);
        return roomMapper.convertEntityToRoomNotCompletedCreatedResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void generateSeatsForRoom(GenerateSeatsRequest request) {
        Room room = roomRepository.findById(request.getRoomId()).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (room.getRoomStatus() != RoomStatus.UNASSIGNED) {
            return;
        }

        if (!room.getSeats().isEmpty()) {
            seatRepository.deleteAllByRoomId(room.getId());
            room.getSeats().clear();
        }

        List<Seat> seats = new ArrayList<>();

        // Tạo map lưu các ghế đặc biệt để tham chiếu nhanh chóng
        Map<String, CustomSeatDTO> customSeatsMap = new HashMap<>();
        if (request.getCustomSeats() != null) {
            for (CustomSeatDTO customSeat : request.getCustomSeats()) {
                String key = customSeat.getRow() + "-" + customSeat.getColumn();
                customSeatsMap.put(key, customSeat);
            }
        }

        int colScreenLabelCount = 0;

        // Tự động tạo ghế dựa trên layout
        for (int row = 0; row < room.getSeatRowNumbers(); row++) {
            for (int col = 0; col < room.getSeatColumnNumbers(); col++) {
                // Tạo một ghế mới
                Seat seat = new Seat();

                seat.setRowName(generateRowName(row));
                seat.setColumnName(String.valueOf(col + 1));
                seat.setRowScreenLabel(generateRowName(row));
                // Kiểm tra xem có phải ghế đặc biệt không
                String key = row + "-" + col;
                if (customSeatsMap.containsKey(key)) {
                    // Nếu là ghế đặc biệt, áp dụng các thuộc tính tùy chỉnh
                    CustomSeatDTO customSeat = customSeatsMap.get(key);
                    seat.setTypeSeat(customSeat.getTypeSeat());

                } else {
                    seat.setTypeSeat(TypeSeat.NORMAL);
                }
                if (seat.getTypeSeat() == TypeSeat.HIDDEN) {
                    seat.setColumnScreenLabel("9999");
                } else if (seat.getTypeSeat() == TypeSeat.DOUBLE) {
                    colScreenLabelCount += 2;
                    seat.setColumnScreenLabel(String.valueOf(colScreenLabelCount));
                } else {
                    seat.setColumnScreenLabel(String.valueOf(++colScreenLabelCount));
                }

                seat.setRoom(room);
                seats.add(seat);
            }
        }

        // Lưu danh sách ghế vào database
        seatRepository.saveAll(seats);

        // Cập nhật trạng thái phòng
        if (room.getRoomStatus() == RoomStatus.UNASSIGNED) {
            room.setRoomStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }
    }

    // Phương thức tạo tên ghế
    private String generateRowName(int row) {
        char rowChar = (char) ('A' + row);
        return String.valueOf(rowChar);
    }

    @Override
    public void createCompletedRoom(RoomHasSeatsRequest roomRequest) {
        Room room = roomMapper.convertCompletedRequestToRoom(roomRequest);
        room.setIsDeleted(false);
        room.setSeats(null);
    }

    @Override
    public void updateRoom(RoomForUpdateRequest roomRequest) {

    }

    @Override
    public void activateRoom(Long id) {

    }

    @Override
    public void deactivateRoom(Long id) {

    }

    @Override
    public void removeRoomHasNoSeats(Long id) {

    }
}
