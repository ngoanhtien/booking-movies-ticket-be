package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.criteria.RoomCriteria;
import com.booking.movieticket.dto.request.admin.create.CustomSeatDTO;
import com.booking.movieticket.dto.request.admin.create.GenerateSeatsRequest;
import com.booking.movieticket.dto.request.admin.create.RoomHasSeatsRequest;
import com.booking.movieticket.dto.request.admin.create.RoomInformationRequest;
import com.booking.movieticket.dto.request.admin.update.RoomForUpdateRequest;
import com.booking.movieticket.dto.response.admin.create.RoomDetailResponse;
import com.booking.movieticket.dto.response.admin.create.RoomNotCompletedCreatedResponse;
import com.booking.movieticket.entity.Category;
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

import java.util.*;

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
    public Page<RoomDetailResponse> getAllRoom(RoomCriteria roomCriteria, Pageable pageable) {
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
    public void generateSeatsForRoom(GenerateSeatsRequest seatRequest) {
        Room room = roomRepository.findById(seatRequest.getRoomId()).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (room.getRoomStatus() != RoomStatus.UNASSIGNED) {
            return;
        }

        if (!room.getSeats().isEmpty()) {
            seatRepository.deleteAllByRoomId(room.getId());
            room.getSeats().clear();
        }

        List<Seat> seats = new ArrayList<>();

        Map<String, CustomSeatDTO> customSeatsMap = new HashMap<>();
        if (seatRequest.getCustomSeats() != null) {
            for (CustomSeatDTO customSeat : seatRequest.getCustomSeats()) {
                String key = customSeat.getRow() + "-" + customSeat.getColumn();
                customSeatsMap.put(key, customSeat);
            }
        }

        int colScreenLabelCount;
        Boolean skipNextSeat = false;
        for (int row = 0; row < room.getSeatRowNumbers(); row++) {
            colScreenLabelCount = 0;
            for (int col = 0; col < room.getSeatColumnNumbers(); col++) {
                if (skipNextSeat) {
                    skipNextSeat = false;
                    continue;
                }
                Seat seat = new Seat();
                seat.setRowName(generateRowName(row));
                seat.setColumnName(String.valueOf(col + 1));
                seat.setRowScreenLabel(generateRowName(row));
                String colKey = String.valueOf(col + 1);
                String key = generateRowName(row) + "-" + colKey ;
                if (customSeatsMap.containsKey(key)) {
                    CustomSeatDTO customSeat = customSeatsMap.get(key);
                    seat.setTypeSeat(customSeat.getTypeSeat());
                } else {
                    seat.setTypeSeat(TypeSeat.NORMAL);
                }
                if (seat.getTypeSeat() == TypeSeat.HIDDEN) {
                    seat.setColumnScreenLabel("9999");
                } else if (seat.getTypeSeat() == TypeSeat.DOUBLE) {
                    seat.setColumnScreenLabel(String.valueOf(++colScreenLabelCount));
                    if (col + 1 < room.getSeatColumnNumbers()) {
                        Seat nextSeat = new Seat();
                        nextSeat.setRowName(generateRowName(row));
                        nextSeat.setColumnName(String.valueOf(col + 2));
                        nextSeat.setRowScreenLabel(generateRowName(row));
                        nextSeat.setTypeSeat(TypeSeat.DOUBLE);
                        nextSeat.setColumnScreenLabel(String.valueOf(++colScreenLabelCount));
                        nextSeat.setRoom(room);
                        seats.add(nextSeat);
                        skipNextSeat = true;
                    } else {
                        seat.setTypeSeat(TypeSeat.NORMAL);
                    }
                } else {
                    seat.setColumnScreenLabel(String.valueOf(++colScreenLabelCount));
                }
                seat.setRoom(room);
                seats.add(seat);
            }
        }
        seatRepository.saveAll(seats);
        if (room.getRoomStatus() == RoomStatus.UNASSIGNED) {
            room.setRoomStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }
    }

    private String generateRowName(int row) {
        char rowChar = (char) ('A' + row);
        return String.valueOf(rowChar);
    }

    @Override
    public void createCompletedRoom(RoomHasSeatsRequest roomRequest) {
        Room room = roomMapper.convertCompletedRequestToRoom(roomRequest);
        room.setIsDeleted(false);
        if (!room.getSeats().isEmpty()) {
            seatRepository.deleteAllByRoomId(room.getId());
            room.getSeats().clear();
        }

        List<Seat> seats = new ArrayList<>();

        Map<String, CustomSeatDTO> customSeatsMap = new HashMap<>();
        if (roomRequest.getGenerateSeatsCompletedRequest().getCustomSeats() != null) {
            for (CustomSeatDTO customSeat : roomRequest.getGenerateSeatsCompletedRequest().getCustomSeats()) {
                String key = customSeat.getRow() + "-" + customSeat.getColumn();
                customSeatsMap.put(key, customSeat);
            }
        }

        int colScreenLabelCount;
        Boolean skipNextSeat = false;
        for (int row = 0; row < room.getSeatRowNumbers(); row++) {
            colScreenLabelCount = 0;
            for (int col = 0; col < room.getSeatColumnNumbers(); col++) {
                if (skipNextSeat) {
                    skipNextSeat = false;
                    continue;
                }
                Seat seat = new Seat();
                seat.setRowName(generateRowName(row));
                seat.setColumnName(String.valueOf(col + 1));
                seat.setRowScreenLabel(generateRowName(row));
                String colKey = String.valueOf(col + 1);
                String key = generateRowName(row) + "-" + colKey ;
                if (customSeatsMap.containsKey(key)) {
                    CustomSeatDTO customSeat = customSeatsMap.get(key);
                    seat.setTypeSeat(customSeat.getTypeSeat());
                } else {
                    seat.setTypeSeat(TypeSeat.NORMAL);
                }
                if (seat.getTypeSeat() == TypeSeat.HIDDEN) {
                    seat.setColumnScreenLabel("9999");
                } else if (seat.getTypeSeat() == TypeSeat.DOUBLE) {
                    seat.setColumnScreenLabel(String.valueOf(++colScreenLabelCount));
                    if (col + 1 < room.getSeatColumnNumbers()) {
                        Seat nextSeat = new Seat();
                        nextSeat.setRowName(generateRowName(row));
                        nextSeat.setColumnName(String.valueOf(col + 2));
                        nextSeat.setRowScreenLabel(generateRowName(row));
                        nextSeat.setTypeSeat(TypeSeat.DOUBLE);
                        nextSeat.setColumnScreenLabel(String.valueOf(++colScreenLabelCount));
                        nextSeat.setRoom(room);
                        seats.add(nextSeat);
                        skipNextSeat = true;
                    } else {
                        seat.setTypeSeat(TypeSeat.NORMAL);
                    }
                } else {
                    seat.setColumnScreenLabel(String.valueOf(++colScreenLabelCount));
                }
                seat.setRoom(room);
                seats.add(seat);
            }
        }
        seatRepository.saveAll(seats);
        roomRepository.save(room);
    }

    @Override
    public void updateRoom(RoomForUpdateRequest roomRequest) {
        if (roomRequest.getId() == null) {
            throw new AppException(ErrorCode.ROOM_NOT_FOUND);
        }
        Room room = roomRepository.findById(roomRequest.getId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        roomMapper.updateRoomFromRequest(roomRequest, room);
        roomRepository.save(room);
    }

    @Override
    public void activateRoom(Long id) {
        updateRoomStatus(id, RoomStatus.AVAILABLE);
    }

    @Override
    public void deactivateRoom(Long id) {
        updateRoomStatus(id, RoomStatus.MAINTENANCE);
    }

    @Override
    public void removeRoomHasNoSeats(Long id) {
        if (id == null) {
            throw new AppException(ErrorCode.ROOM_NOT_FOUND);
        }
        Room room = roomRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        if (room.getRoomStatus() == RoomStatus.UNASSIGNED) {
            roomRepository.delete(room);
        } else {
            throw new AppException(ErrorCode.ROOM_IS_NOT_UNASSIGNED);
        }
    }

    private void updateRoomStatus(Long id, RoomStatus roomStatus) {
        if (id == null) {
            throw new AppException(ErrorCode.ROOM_NOT_FOUND);
        }
        if (roomStatus == RoomStatus.UNASSIGNED) {
            throw new AppException(ErrorCode.ROOM_IS_UNASSIGNED);
        }
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        if (Objects.equals(room.getRoomStatus(), roomStatus)) {
            return;
        }
        room.setRoomStatus(roomStatus);
        roomRepository.save(room);
    }
}
