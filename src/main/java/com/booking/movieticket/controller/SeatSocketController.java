package com.booking.movieticket.controller;

import com.booking.movieticket.dto.request.SeatReservationRequest;
import com.booking.movieticket.dto.response.SeatReservationResponse;
import com.booking.movieticket.entity.ShowtimeSeat;
import com.booking.movieticket.entity.compositekey.ShowtimeId;
import com.booking.movieticket.entity.enums.StatusSeat;
import com.booking.movieticket.repository.ShowtimeSeatRepository;
import com.booking.movieticket.security.jwt.DomainUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@RequiredArgsConstructor
@Slf4j
public class SeatSocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ShowtimeSeatRepository showtimeSeatRepository;
    
    // Map to track temporary seat reservations: roomId-scheduleId-seatId -> {userId, timestamp}
    private final ConcurrentHashMap<String, Map<String, Object>> temporaryReservations = new ConcurrentHashMap<>();
    
    // Timeout for temporary reservations (in minutes)
    private static final int RESERVATION_TIMEOUT_MINUTES = 5;
    
    /**
     * Handle temporary seat reservation requests from clients
     */
    @MessageMapping("/seats/reserve/{roomId}/{scheduleId}")
    @SendTo("/topic/seats/{roomId}/{scheduleId}")
    public SeatReservationResponse reserveSeat(@DestinationVariable Long roomId, 
                                             @DestinationVariable Long scheduleId,
                                             SeatReservationRequest request) {
        try {
            String userId = request.getUserId();
            Long seatId = request.getSeatId();
            StatusSeat status = request.getStatus();
            
            log.debug("Received seat reservation: Room={}, Schedule={}, Seat={}, User={}, Status={}", 
                roomId, scheduleId, seatId, userId, status);
            
            // Create a unique key for this seat
            String seatKey = roomId + "-" + scheduleId + "-" + seatId;
            
            // If reservation is being made (SELECTED status)
            if (status == StatusSeat.SELECTED) {
                // Store the reservation with timestamp
                Map<String, Object> reservationInfo = new HashMap<>();
                reservationInfo.put("userId", userId);
                reservationInfo.put("timestamp", Instant.now().toEpochMilli());
                temporaryReservations.put(seatKey, reservationInfo);
                
                log.debug("Temporary reservation created for seat {}", seatKey);
            } 
            // If seat is being released (AVAILABLE status)
            else if (status == StatusSeat.AVAILABLE) {
                // Only allow if this user made the reservation
                Map<String, Object> existing = temporaryReservations.get(seatKey);
                if (existing != null && existing.get("userId").equals(userId)) {
                    temporaryReservations.remove(seatKey);
                    log.debug("Temporary reservation removed for seat {}", seatKey);
                } else {
                    log.warn("User {} attempted to release seat {} reserved by another user", userId, seatKey);
                    // Don't allow the action, return current status
                    return createCurrentStatusResponse(roomId, scheduleId, seatId, userId);
                }
            }
            
            // Return the response to broadcast to all clients
            return SeatReservationResponse.builder()
                    .seatId(seatId)
                    .status(status)
                    .userId(userId)
                    .roomId(roomId)
                    .scheduleId(scheduleId)
                    .timestamp(Instant.now().toEpochMilli())
                    .build();
        } catch (Exception e) {
            log.error("Error processing seat reservation", e);
            return SeatReservationResponse.builder()
                    .error("Error processing reservation: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Check seat status before allowing action
     */
    private SeatReservationResponse createCurrentStatusResponse(Long roomId, Long scheduleId, Long seatId, String userId) {
        String seatKey = roomId + "-" + scheduleId + "-" + seatId;
        Map<String, Object> reservationInfo = temporaryReservations.get(seatKey);
        
        if (reservationInfo != null) {
            String currentUserId = (String) reservationInfo.get("userId");
            return SeatReservationResponse.builder()
                    .seatId(seatId)
                    .status(StatusSeat.SELECTED)
                    .userId(currentUserId)
                    .roomId(roomId)
                    .scheduleId(scheduleId)
                    .timestamp((Long) reservationInfo.get("timestamp"))
                    .build();
        }
        
        // Check database for permanent status
        try {
            List<ShowtimeSeat> seats = showtimeSeatRepository.findByShowtimeId(scheduleId, roomId);
            for (ShowtimeSeat seat : seats) {
                if (seat.getId().equals(seatId)) {
                    return SeatReservationResponse.builder()
                            .seatId(seatId)
                            .status(seat.getStatus())
                            .userId("system")  // System-set status
                            .roomId(roomId)
                            .scheduleId(scheduleId)
                            .timestamp(Instant.now().toEpochMilli())
                            .build();
                }
            }
        } catch (Exception e) {
            log.error("Error checking seat status in database", e);
        }
        
        // Default to available if not found
        return SeatReservationResponse.builder()
                .seatId(seatId)
                .status(StatusSeat.AVAILABLE)
                .userId("system")
                .roomId(roomId)
                .scheduleId(scheduleId)
                .timestamp(Instant.now().toEpochMilli())
                .build();
    }
    
    /**
     * Regularly clean up expired temporary reservations
     */
    @Scheduled(fixedDelay = 60000) // Run every minute
    @Transactional // Added @Transactional to allow database access
    public void cleanupExpiredReservations() {
        Instant cutoff = Instant.now().minus(RESERVATION_TIMEOUT_MINUTES, ChronoUnit.MINUTES);
        long cutoffTime = cutoff.toEpochMilli();
        int cleaned = 0;
        int notBroadcastedDueToBooking = 0; // Counter for seats not broadcasted

        log.debug("Starting cleanup of expired temporary seat reservations. Cutoff time: {}", cutoff);

        for (Map.Entry<String, Map<String, Object>> entry : temporaryReservations.entrySet()) {
            Long timestamp = (Long) entry.getValue().get("timestamp");
            String seatKey = entry.getKey();

            if (timestamp < cutoffTime) {
                log.debug("Temporary reservation for seatKey {} with timestamp {} is expired.", seatKey, timestamp);
                // Parse the key to get components
                String[] parts = seatKey.split("-");
                if (parts.length != 3) {
                    log.error("Invalid seatKey format found during cleanup: {}. Skipping.", seatKey);
                    temporaryReservations.remove(seatKey); // Remove malformed key
                    cleaned++; // Count as cleaned to avoid reprocessing
                    continue;
                }

                Long roomId = Long.parseLong(parts[0]);
                Long scheduleId = Long.parseLong(parts[1]);
                Long seatId = Long.parseLong(parts[2]);

                // Check database status before broadcasting AVAILABLE
                try {
                    ShowtimeSeat seatInDb = showtimeSeatRepository.findById(seatId)
                        .orElse(null); // Find by primary key

                    if (seatInDb != null && seatInDb.getStatus() == StatusSeat.BOOKED) {
                        log.info("Seat {} (Key: {}) was BOOKED in DB. Removing from temporary reservations without broadcasting AVAILABLE.", seatId, seatKey);
                        notBroadcastedDueToBooking++;
                    } else {
                        // If not booked, or not found (should ideally not happen if key is valid), proceed to mark AVAILABLE
                        log.debug("Seat {} (Key: {}) is not BOOKED in DB (or not found). Broadcasting AVAILABLE.", seatId, seatKey);
                        SeatReservationResponse update = SeatReservationResponse.builder()
                                .seatId(seatId)
                                .status(StatusSeat.AVAILABLE)
                                .userId("system_timeout") // Clarify source of update
                                .roomId(roomId)
                                .scheduleId(scheduleId)
                                .timestamp(Instant.now().toEpochMilli())
                                .build();
                        messagingTemplate.convertAndSend("/topic/seats/" + roomId + "/" + scheduleId, update);
                        log.info("Broadcasted AVAILABLE for expired seatId {} (Key: {}) for showtime {}/{}", seatId, seatKey, roomId, scheduleId);
                    }
                } catch (Exception e) {
                    log.error("Error checking database status for seatId {} (Key: {}) during cleanup. Seat will be removed from temp reservations.", seatId, seatKey, e);
                    // Still remove from temporary reservations to prevent loop, but log error
                }
                
                temporaryReservations.remove(seatKey);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            log.info("Finished cleanup. Cleaned {} expired seat reservations. {} reservations were already BOOKED and not broadcasted as AVAILABLE.", cleaned, notBroadcastedDueToBooking);
        }
    }
    
    /**
     * Sync with database to ensure temporary reservations reflect current DB state
     */
    @Scheduled(fixedDelay = 300000) // Every 5 minutes
    @Transactional(readOnly = true)
    public void syncWithDatabase() {
        log.info("Starting periodic sync of temporary seat reservations with database."); // Changed to info
        
        Map<ShowtimeId, List<ShowtimeSeat>> showtimesCache = new HashMap<>();
        int syncedToBooked = 0;
        int alreadyConsistent = 0;
        int keysProcessed = 0;

        for (String seatKey : temporaryReservations.keySet()) { // Iterate over keys to allow removal
            keysProcessed++;
            String[] parts = seatKey.split("-");
            if (parts.length != 3) {
                log.warn("Invalid seatKey format found during DB sync: {}. Skipping.", seatKey);
                continue;
            }

            try {
                Long roomId = Long.parseLong(parts[0]);
                Long scheduleId = Long.parseLong(parts[1]);
                Long seatId = Long.parseLong(parts[2]);

                ShowtimeId showtimeId = new ShowtimeId(scheduleId, roomId);

                // Use cached seat list or fetch from database
                List<ShowtimeSeat> seats = showtimesCache.computeIfAbsent(showtimeId,
                    id -> {
                        log.debug("DB Sync: Fetching seats for showtimeId: {}", id);
                        return showtimeSeatRepository.findByShowtimeId(id.getScheduleId(), id.getRoomId());
                    });

                ShowtimeSeat seatInDb = seats.stream()
                    .filter(s -> s.getId().equals(seatId))
                    .findFirst()
                    .orElse(null);

                if (seatInDb != null) {
                    if (seatInDb.getStatus() == StatusSeat.BOOKED) {
                        // Seat is booked in DB but still in temporary reservations, remove it
                        temporaryReservations.remove(seatKey); // Safe to remove while iterating a copy of keyset or manage iterator

                        // Notify clients about the updated status
                        SeatReservationResponse update = SeatReservationResponse.builder()
                                .seatId(seatId)
                                .status(StatusSeat.BOOKED)
                                .userId("system_sync") // Clarify source
                                .roomId(roomId)
                                .scheduleId(scheduleId)
                                .timestamp(Instant.now().toEpochMilli())
                                .build();

                        messagingTemplate.convertAndSend("/topic/seats/" + roomId + "/" + scheduleId, update);
                        log.info("DB Sync: Seat {} (Key: {}) status updated to BOOKED from database and removed from temp reservations.", seatId, seatKey);
                        syncedToBooked++;
                    } else {
                        // Seat in DB is not BOOKED, but is in temporary reservations. This is an expected state for an active selection.
                        log.debug("DB Sync: Seat {} (Key: {}) is in temp reservations and status in DB is {}. No action needed.", seatId, seatKey, seatInDb.getStatus());
                        alreadyConsistent++;
                    }
                } else {
                    // Seat is in temporary reservations but not found in DB for that showtime.
                    // This could mean the seat or showtime was deleted, or data inconsistency.
                    log.warn("DB Sync: Seat {} (Key: {}) in temporary reservations but not found in database for showtime {}/{}. Removing from temp.", seatId, seatKey, roomId, scheduleId);
                    temporaryReservations.remove(seatKey);
                }

            } catch (NumberFormatException e) {
                log.error("DB Sync: Invalid seat key format: {}", seatKey, e);
            } catch (Exception e) {
                log.error("DB Sync: Error during database sync for seat key: {}", seatKey, e);
            }
        }
        log.info("Finished DB sync. Processed {} temporary reservation keys. Synced {} to BOOKED. {} were already consistent or handled.", keysProcessed, syncedToBooked, alreadyConsistent);
    }
} 