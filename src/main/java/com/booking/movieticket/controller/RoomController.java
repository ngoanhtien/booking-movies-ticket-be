package com.booking.movieticket.controller;

import com.booking.movieticket.dto.criteria.RoomCriteria;
import com.booking.movieticket.dto.request.admin.create.GenerateSeatsRequest;
import com.booking.movieticket.dto.request.admin.create.RoomHasSeatsRequest;
import com.booking.movieticket.dto.request.admin.create.RoomInformationRequest;
import com.booking.movieticket.dto.request.admin.update.RoomForUpdateRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.admin.create.RoomDetailResponse;
import com.booking.movieticket.dto.response.admin.create.RoomInformationCreatedResponse;
import com.booking.movieticket.dto.response.admin.create.RoomNotCompletedCreatedResponse;
import com.booking.movieticket.service.RoomService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
@CrossOrigin(origins = "*")
@Validated
public class RoomController {

    RoomService roomService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<RoomDetailResponse>>> getAllRoomByBranchId(RoomCriteria roomCriteria,
                                                                                      @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Rooms fetched successfully.", roomService.getAllRoomByBranchId(roomCriteria, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomDetailResponse>> getRoomById(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Room details fetched successfully.", roomService.getRoomById(id)));
    }

    @PostMapping("")
    public ResponseEntity<ApiResponse<RoomNotCompletedCreatedResponse>> createNotCompletedRoom(@Valid @RequestBody RoomInformationRequest branchRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>("Room created successfully.", roomService.createNotCompletedRoom(branchRequest)));
    }

    @PostMapping("/room/generate-seats")
    public ResponseEntity<ApiResponse<String>> generateSeatsForRoom(@Valid @RequestBody GenerateSeatsRequest request) {
        roomService.generateSeatsForRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("Seats generated for room successfully."));
    }
    @PostMapping("/roomHasSeats")
    public ResponseEntity<ApiResponse<String>> createCompletedRoom(@Valid @RequestBody RoomHasSeatsRequest branchRequest) {
        roomService.createCompletedRoom(branchRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>("Available room created successfully."));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<String>> updateRoom(@Valid @RequestPart RoomForUpdateRequest branchRequest) {
        roomService.updateRoom(branchRequest);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("Room updated successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> activateRoom(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        roomService.activateRoom(id);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("Room activated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateRoom(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        roomService.deactivateRoom(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Room deactivated successfully."));
    }

    @DeleteMapping("/roomNoSeats/{id}")
    public ResponseEntity<?> removeRoomHasNoSeats(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        roomService.removeRoomHasNoSeats(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Room removed successfully."));
    }
}
