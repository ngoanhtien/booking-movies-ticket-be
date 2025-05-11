package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.criteria.RoomCriteria;
import com.booking.movieticket.dto.request.admin.create.GenerateSeatsRequest;
import com.booking.movieticket.dto.request.admin.create.RoomHasSeatsRequest;
import com.booking.movieticket.dto.request.admin.create.RoomInformationRequest;
import com.booking.movieticket.dto.request.admin.update.RoomForUpdateRequest;
import com.booking.movieticket.dto.response.admin.create.RoomDetailResponse;
import com.booking.movieticket.dto.response.admin.create.RoomNotCompletedCreatedResponse;
import com.booking.movieticket.entity.Room;
import com.booking.movieticket.entity.enums.RoomStatus;
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
    @Transactional
    public void generateSeatsForRoom(GenerateSeatsRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (request.getOverrideExistingSeats() && !room.getSeats().isEmpty()) {
            seatRepository.deleteAllByRoomId(room.getId());
            room.getSeats().clear();
        }

        List<Seat> seats = new ArrayList<>();

        // Tạo map lưu các ghế đặc biệt để tham chiếu nhanh chóng
        Map<String, CustomSeatDto> customSeatsMap = new HashMap<>();
        if (request.getCustomSeats() != null) {
            for (CustomSeatDto customSeat : request.getCustomSeats()) {
                String key = customSeat.getRowPosition() + "-" + customSeat.getColumnPosition();
                customSeatsMap.put(key, customSeat);
            }
        }

        // Tự động tạo ghế dựa trên layout
        for (int row = 0; row < room.getSeatRowNumbers(); row++) {
            for (int col = 0; col < room.getSeatColumnNumbers(); col++) {
                // Bỏ qua vị trí lối đi nếu có
                if (isAislePosition(room, row, col)) {
                    continue;
                }

                // Tạo một ghế mới
                Seat seat = new Seat();

                // Đặt tên ghế (thường là kết hợp của chữ cái hàng và số cột)
                seat.setName(generateSeatName(row, col));
                seat.setRowPosition(row);
                seat.setColumnPosition(col);

                // Kiểm tra xem có phải ghế đặc biệt không
                String key = row + "-" + col;
                if (customSeatsMap.containsKey(key)) {
                    // Nếu là ghế đặc biệt, áp dụng các thuộc tính tùy chỉnh
                    CustomSeatDto customSeat = customSeatsMap.get(key);
                    seat.setSeatType(customSeat.getSeatType());
                    seat.setSeatStatus(customSeat.getSeatStatus());
                } else {
                    // Không phải ghế đặc biệt, thiết lập các giá trị mặc định
                    // Xác định loại ghế (VIP, đôi, thường, v.v.) dựa trên vị trí và cấu hình phòng
                    seat.setSeatType(determineSeatType(room, row, col));
                    seat.setSeatStatus(SeatStatus.ACTIVE); // Mặc định ghế có trạng thái ACTIVE
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

    // Phương thức xác định vị trí lối đi
    private boolean isAislePosition(Room room, int row, int col) {
        // Lối đi giữa (theo chiều ngang)
        if (room.getAislePosition() != null && col == room.getAislePosition()) {
            return true;
        }

        // Có thể thêm logic cho lối đi khác nếu cần
        return false;
    }

    // Phương thức tạo tên ghế
    private String generateSeatName(int row, int col) {
        // Chuyển số hàng thành chữ cái (0 -> A, 1 -> B, v.v.)
        char rowChar = (char) ('A' + row);
        // Cột bắt đầu từ 1
        int colNumber = col + 1;

        return rowChar + String.valueOf(colNumber);
    }

    // Phương thức xác định loại ghế
    private SeatType determineSeatType(Room room, int row, int col) {
        // Ghế đôi ở các hàng cuối (nếu có)
        if (room.getDoubleSeatRowNumbers() != null &&
                row >= (room.getSeatRowNumbers() - room.getDoubleSeatRowNumbers())) {
            return SeatType.DOUBLE;
        }

        // Ghế VIP ở khu vực giữa
        int midRow = room.getSeatRowNumbers() / 2;
        int midCol = room.getSeatColumnNumbers() / 2;

        // Xác định nếu ghế nằm trong khu vực VIP (khu vực trung tâm)
        if (Math.abs(row - midRow) <= room.getSeatRowNumbers() / 4 &&
                Math.abs(col - midCol) <= room.getSeatColumnNumbers() / 4) {
            return SeatType.VIP;
        }

        // Mặc định là ghế thường
        return SeatType.STANDARD;
    }

    @Override
    public RoomNotCompletedCreatedResponse createNotCompletedRoom(RoomInformationRequest roomRequest) {
        Room room = roomMapper.convertNotCompletedRequestToRoom(roomRequest);
        room.setIsDeleted(false);
        room.setSeats(null);
        room.setShowtimes(null);
        return roomMapper.convertEntityToRoomNotCompletedCreatedResponse(roomRepository.save(room));
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
