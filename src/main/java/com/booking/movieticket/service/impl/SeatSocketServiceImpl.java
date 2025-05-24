package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.request.SeatReservationRequest;
import com.booking.movieticket.dto.response.SeatReservationResponse;
import com.booking.movieticket.entity.ShowtimeSeat;
import com.booking.movieticket.entity.enums.StatusSeat;
import com.booking.movieticket.repository.ShowtimeSeatRepository;
import com.booking.movieticket.service.CacheSeatService;
import com.booking.movieticket.service.SeatSocketService;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SeatSocketServiceImpl implements SeatSocketService {
    private final SimpMessagingTemplate messagingTemplate;
    private final ShowtimeSeatRepository showtimeSeatRepository;
    private final CacheSeatService temporaryReservations;
    // Timeout for temporary reservations (in minutes)
    private static final int RESERVATION_TIMEOUT_MINUTES = 5;


    // Entry point: process a reservation or release and return the appropriate response
    @Override
    public SeatReservationResponse sendSeatReservationResponse(
            SeatReservationRequest request,
            Long roomId,
            Long scheduleId) {
        try {
            String userId = request.getUserId();
            Long seatId = request.getSeatId();
            StatusSeat status = request.getStatus();

            log.debug("Received seat reservation: Room={}, Schedule={}, Seat={}, User={}, Status={}",
                    roomId, scheduleId, seatId, userId, status);

            String seatKey = buildSeatKey(roomId, scheduleId, seatId);

            // Handle a new temporary seat selection
            if (status == StatusSeat.SELECTED) {
                handleSelection(seatKey, userId);
            }
            // Handle a release request or invalid release attempt
            else if (status == StatusSeat.AVAILABLE) {
                return handleRelease(seatKey, userId, roomId, scheduleId, seatId);
            }

            // Build and return a successful response with the chosen status
            return buildSuccessResponse(roomId, scheduleId, seatId, userId, status);
        } catch (Exception e) {
            log.error("Error processing seat reservation", e);
            // Return an error response if anything goes wrong
            return buildErrorResponse(e.getMessage());
        }
    }

    // Create a unique key string for identifying a specific seat
    private String buildSeatKey(Long roomId, Long scheduleId, Long seatId) {
        return String.format("%d-%d-%d", roomId, scheduleId, seatId);
    }

    // Store the user's selection with a timestamp for temporary locking
    private void handleSelection(String seatKey, String userId) {
        Map<String, Object> info = new HashMap<>();
        info.put("userId", userId);
        info.put("timestamp", Instant.now().toEpochMilli());
        temporaryReservations.put(seatKey, info);
        log.debug("Temporary reservation created for seat {}", seatKey);
    }

    // Attempt to release a reservation; if unauthorized, return the current status
    private SeatReservationResponse handleRelease(
            String seatKey,
            String userId,
            Long roomId,
            Long scheduleId,
            Long seatId) {
        Map<String, Object> existing = temporaryReservations.get(seatKey);
        if (existing != null && existing.get("userId").equals(userId)) {
            temporaryReservations.remove(seatKey);
            log.debug("Temporary reservation removed for seat {}", seatKey);
            return buildSuccessResponse(roomId, scheduleId, seatId, userId, StatusSeat.AVAILABLE);
        }
        log.warn("User {} attempted to release seat {} reserved by another user", userId, seatKey);
        // Return whatever status is actually held by this seat now
        return createCurrentStatusResponse(roomId, scheduleId, seatId, userId);
    }

    // Build a successful response payload for broadcasting
    private SeatReservationResponse buildSuccessResponse(
            Long roomId,
            Long scheduleId,
            Long seatId,
            String userId,
            StatusSeat status) {
        return SeatReservationResponse.builder()
                .seatId(seatId)
                .status(status)
                .userId(userId)
                .roomId(roomId)
                .scheduleId(scheduleId)
                .timestamp(Instant.now().toEpochMilli())
                .build();
    }

    // Build a response indicating an error occurred
    private SeatReservationResponse buildErrorResponse(String errorMsg) {
        return SeatReservationResponse.builder()
                .error("Error processing reservation: " + errorMsg)
                .build();
    }

    // Retrieve the actual current status (temporary or permanent) before denying an action
    private SeatReservationResponse createCurrentStatusResponse(
            Long roomId,
            Long scheduleId,
            Long seatId,
            String userId) {
        String seatKey = buildSeatKey(roomId, scheduleId, seatId);
        Map<String, Object> tempInfo = temporaryReservations.get(seatKey);
        if (tempInfo != null) {
            return SeatReservationResponse.builder()
                    .seatId(seatId)
                    .status(StatusSeat.SELECTED)
                    .userId((String) tempInfo.get("userId"))
                    .roomId(roomId)
                    .scheduleId(scheduleId)
                    .timestamp((Long) tempInfo.get("timestamp"))
                    .build();
        }
        // Fallback to database lookup if no temporary reservation exists
        return lookupPermanentStatus(roomId, scheduleId, seatId);
    }

    // Look up the permanent seat status in the database, defaulting to AVAILABLE
    private SeatReservationResponse lookupPermanentStatus(
            Long roomId,
            Long scheduleId,
            Long seatId) {
        try {
            List<ShowtimeSeat> seats = showtimeSeatRepository.findByShowtimeId(scheduleId, roomId);
            for (ShowtimeSeat seat : seats) {
                if (seat.getId().equals(seatId)) {
                    return SeatReservationResponse.builder()
                            .seatId(seatId)
                            .status(seat.getStatus())
                            .userId("system")
                            .roomId(roomId)
                            .scheduleId(scheduleId)
                            .timestamp(Instant.now().toEpochMilli())
                            .build();
                }
            }
        } catch (Exception e) {
            log.error("Error checking seat status in database", e);
        }
        // Default to AVAILABLE when nothing else applies
        return buildSuccessResponse(roomId, scheduleId, seatId, "system", StatusSeat.AVAILABLE);
    }


}
