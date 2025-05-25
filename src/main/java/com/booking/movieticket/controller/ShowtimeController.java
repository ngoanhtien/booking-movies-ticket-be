package com.booking.movieticket.controller;

import com.booking.movieticket.dto.request.admin.create.ShowtimeForCreateRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.ShowtimeDetailResponse;
import com.booking.movieticket.dto.response.ShowtimeResponse;
import com.booking.movieticket.entity.*;
import com.booking.movieticket.entity.compositekey.ShowtimeId;
import com.booking.movieticket.entity.enums.StatusMovie;
import com.booking.movieticket.entity.enums.StatusSeat;
import com.booking.movieticket.entity.enums.TypeSeat;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.security.jwt.DomainUserDetails;
import com.booking.movieticket.service.CacheSeatService;
import com.booking.movieticket.service.ShowtimeService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/showtime")
@CrossOrigin(origins = "*")
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    @Autowired
    private EntityManager entityManager;

    private CacheSeatService cacheSeatService;
    @Autowired
    public ShowtimeController(ShowtimeService showtimeService) {
        this.showtimeService = showtimeService;
    }

    @GetMapping("/public/ping")
    public ResponseEntity<String> pingPublic() {
        log.info("Public ping endpoint /showtime/public/ping called!");
        return ResponseEntity.ok("Pong from /showtime/public/ping!");
    }

    /**
     * Get all showtimes for a specific movie on a specific date
     *
     * @param movieId ID of the movie
     * @param date    Date for which to retrieve showtimes (format: yyyy-MM-dd)
     * @return API response with showtimes organized by branch for the specified date
     */
    @GetMapping("/{movieId}/by-date")
    public ResponseEntity<ApiResponse<?>> getShowtimesByMovieAndDate(
            @PathVariable Long movieId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Fetching showtimes for movie with ID: {} on date: {}", movieId, date);
        ShowtimeResponse showtimeResponse = showtimeService.getShowtimesByMovieAndDate(movieId, date);
        return ResponseEntity.ok(new ApiResponse<>(
                "Successfully retrieved showtimes for movie on specified date", showtimeResponse));
    }

    /**
     * Get all showtimes for a specific movie on a specific date, optionally filtered by cinema
     *
     * @param movieId  ID of the movie
     * @param date     Date for which to retrieve showtimes (format: yyyy-MM-dd)
     * @param cinemaId Optional ID of the cinema to filter by
     * @return API response with showtimes organized by branch for the specified criteria
     */
    @GetMapping("/{movieId}/filter")
    public ResponseEntity<ApiResponse<?>> getShowtimesByMovieAndDate(
            @PathVariable Long movieId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long cinemaId) {
        ShowtimeResponse showtimeResponse = showtimeService.getShowtimesByMovieAndDateAndCinema(movieId, date, cinemaId);

        return ResponseEntity.ok(new ApiResponse<>(
                "Successfully retrieved showtimes for movie based on specified criteria", showtimeResponse));
    }

    /**
     * Get all available dates for a specific movie that has showtimes
     *
     * @param movieId ID of the movie
     * @return API response with list of available dates
     */
    @GetMapping("/{movieId}/available-dates")
    public ResponseEntity<ApiResponse<?>> getAvailableDatesByMovie(@PathVariable Long movieId) {
        log.info("Fetching available dates for movie with ID: {}", movieId);
        List<LocalDate> availableDates = showtimeService.getAvailableDatesByMovie(movieId);
        return ResponseEntity.ok(new ApiResponse<>(
                "Successfully retrieved available dates for movie", availableDates));
    }

    /**
     * API to get detail information for a specific showtime
     */
    @GetMapping("/{scheduleId}/{roomId}")
    public ResponseEntity<ApiResponse<ShowtimeDetailResponse>> getShowtimeDetail(
            @PathVariable Long scheduleId,
            @PathVariable Long roomId,
            @RequestParam(required = false) Long timestamp) {
        try {
            ShowtimeDetailResponse showtimeDetail = showtimeService.getShowtimeDetail(scheduleId, roomId);
            return ResponseEntity.ok(new ApiResponse<>("Successfully retrieved showtime detail", showtimeDetail));
        } catch (AppException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Error retrieving showtime detail", null));
        }
    }

    // Endpoint tạm thời để thêm lịch chiếu cho phim ID 8
    @GetMapping("/add-sample-showtimes")
    @Transactional
    public ResponseEntity<ApiResponse<?>> addSampleShowtimes() {
        try {
            // Thêm lịch chiếu cho phim ID 8
            LocalDate today = LocalDate.now();
            LocalDate tomorrow = today.plusDays(1);

            // Danh sách thời gian chiếu
            LocalTime[] times = {
                    LocalTime.of(10, 0),
                    LocalTime.of(13, 30),
                    LocalTime.of(17, 0)
            };

            // Phòng chiếu
            Long[] roomIds = {1L, 3L};

            List<String> addedShowtimes = new ArrayList<>();

            // Tạo lịch chiếu cho hôm nay và ngày mai
            for (LocalDate date : new LocalDate[]{today, tomorrow}) {
                for (LocalTime time : times) {
                    // Tạo schedule mới
                    Schedule schedule = new Schedule();
                    schedule.setDate(date);
                    schedule.setTimeStart(time);

                    // Tìm phim có ID 8
                    Movie movie = entityManager.find(Movie.class, 8L);
                    if (movie == null) {
                        return ResponseEntity.ok(new ApiResponse<>("Movie with ID 8 not found", null));
                    }

                    schedule.setMovie(movie);
                    schedule.setIsDeleted(false); // Set isDeleted to false for new schedule

                    // Lưu schedule
                    entityManager.persist(schedule);

                    // Tạo showtime cho mỗi phòng
                    for (Long roomId : roomIds) {
                        Room room = entityManager.find(Room.class, roomId);
                        if (room != null) {
                            // KIỂM TRA SỰ TỒN TẠI CỦA SHOWTIME
                            Query checkQuery = entityManager.createQuery(
                                    "SELECT COUNT(st) FROM Showtime st WHERE st.schedule.id = :scheduleId AND st.room.id = :roomId");
                            checkQuery.setParameter("scheduleId", schedule.getId());
                            checkQuery.setParameter("roomId", roomId);
                            Long count = (Long) checkQuery.getSingleResult();

                            if (count == 0) { // Chỉ tạo nếu Showtime chưa tồn tại
                                Showtime showtime = new Showtime();
                                ShowtimeId showtimeId = new ShowtimeId();
                                showtimeId.setScheduleId(schedule.getId());
                                showtimeId.setRoomId(roomId);

                                showtime.setId(showtimeId);
                                showtime.setSchedule(schedule);
                                showtime.setRoom(room);
                                showtime.setFormat(room.getRoomType().toString());
                                showtime.setIsDeleted(false);

                                entityManager.persist(showtime);

                                Query seatQuery = entityManager.createQuery("SELECT s FROM Seat s WHERE s.room.id = :roomId");
                                seatQuery.setParameter("roomId", roomId);
                                List<Seat> seats = seatQuery.getResultList();

                                for (Seat seat : seats) {
                                    // CHECK IF ShowtimeSeat ALREADY EXISTS
                                    ShowtimeSeat existingShowtimeSeat = null;
                                    try {
                                        Query findExistingSeatQuery = entityManager.createQuery(
                                                "SELECT ss FROM ShowtimeSeat ss WHERE ss.showtime.id.scheduleId = :scheduleId AND ss.showtime.id.roomId = :roomId AND ss.seat.id = :seatId");
                                        findExistingSeatQuery.setParameter("scheduleId", schedule.getId());
                                        findExistingSeatQuery.setParameter("roomId", room.getId());
                                        findExistingSeatQuery.setParameter("seatId", seat.getId());
                                        existingShowtimeSeat = (ShowtimeSeat) findExistingSeatQuery.getSingleResult();
                                    } catch (jakarta.persistence.NoResultException nre) {
                                        // Expected if it doesn't exist
                                    }

                                    if (existingShowtimeSeat == null) {
                                        ShowtimeSeat showtimeSeat = new ShowtimeSeat();
                                        showtimeSeat.setShowtime(showtime);
                                        showtimeSeat.setSeat(seat);
                                        showtimeSeat.setStatus(StatusSeat.AVAILABLE);

                                        double basePrice = 100000;
                                        if (seat.getTypeSeat() == TypeSeat.VIP) {
                                            basePrice += 20000;
                                        } else if (seat.getTypeSeat() == TypeSeat.DOUBLE) {
                                            basePrice += 40000;
                                        }
                                        showtimeSeat.setPrice(basePrice);
                                        entityManager.persist(showtimeSeat);
                                    } else {
                                        log.warn("SKIPPED ShowtimeSeat in /add-sample-showtimes - Already exists for ScheduleId: {}, RoomId: {}, Seat: {}. Status: {}",
                                                schedule.getId(), room.getId(), seat.getId(), existingShowtimeSeat.getStatus());
                                    }
                                }

                                addedShowtimes.add(String.format("CREATED - Date: %s, Time: %s, Room: %s, ScheduleId: %d", date, time, room.getName(), schedule.getId()));
                                log.info("CREATED - Showtime for ScheduleId: {} and RoomId: {}", schedule.getId(), roomId);
                            } else {
                                log.info("SKIPPED - Showtime already exists for ScheduleId: {} and RoomId: {}", schedule.getId(), roomId);
                                addedShowtimes.add(String.format("SKIPPED - Date: %s, Time: %s, Room: %s, ScheduleId: %d", date, time, room.getName(), schedule.getId()));
                            }
                        }
                    }
                }
            }

            return ResponseEntity.ok(new ApiResponse<>("Added sample showtimes for movie ID 8", addedShowtimes));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>("Error adding sample showtimes: " + e.getMessage(), null));
        }
    }

    // Public endpoint để kiểm tra danh sách phim có sẵn
    @GetMapping("/public/check-movies")
    public ResponseEntity<ApiResponse<?>> checkMoviesPublic() {
        try {
            Query query = entityManager.createQuery("SELECT m FROM Movie m ORDER BY m.id");
            List<Movie> movies = query.getResultList();

            List<Map<String, Object>> movieInfoList = new ArrayList<>();
            for (Movie movie : movies) {
                Map<String, Object> movieInfo = new HashMap<>();
                movieInfo.put("id", movie.getId());
                movieInfo.put("name", movie.getName());
                movieInfo.put("status", movie.getStatus());
                movieInfoList.add(movieInfo);
            }

            return ResponseEntity.ok(new ApiResponse<>("Available movies in the system", movieInfoList));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>("Error checking movies: " + e.getMessage(), null));
        }
    }

    // Public endpoint để thêm lịch chiếu cho tất cả phim đang hoạt động
    @PostMapping("/public/add-showtimes-for-active-movies")
    @Transactional
    public ResponseEntity<ApiResponse<?>> addShowtimesForActiveMoviesPublic() {
        log.info("Starting creation of showtimes for active movies");

        try {
            // Lấy danh sách phim SHOWING
            long startTime = System.currentTimeMillis();
            Query query = entityManager.createQuery("SELECT m FROM Movie m WHERE m.status = :status");
            query.setParameter("status", StatusMovie.SHOWING);
            List<Movie> showingMovies = query.getResultList();

            if (showingMovies.isEmpty()) {
                log.warn("No movies currently in 'SHOWING' status found");
                return ResponseEntity.ok(new ApiResponse<>("No movies currently in 'SHOWING' status found", null));
            }
            log.info("Fetched {} movies in 'SHOWING' status", showingMovies.size());

            // Prepare dates and times
            LocalDate today = LocalDate.now();
            LocalDate tomorrow = today.plusDays(1);
            LocalDate[] datesToProcess = {today, tomorrow};

            // Danh sách thời gian chiếu
            LocalTime[] times = {
                    LocalTime.of(10, 0),
                    LocalTime.of(13, 30),
                    LocalTime.of(17, 0),
                    LocalTime.of(20, 30)
            };

            // Lấy danh sách tất cả các phòng chiếu có sẵn một lần duy nhất
            Query roomQuery = entityManager.createQuery("SELECT r FROM Room r WHERE r.isDeleted = false");
            List<Room> allRooms = roomQuery.getResultList();

            if (allRooms.isEmpty()) {
                log.warn("No active rooms found in the system.");
                return ResponseEntity.ok(new ApiResponse<>("No active rooms found. Cannot create showtimes.", null));
            }
            log.info("Found {} active rooms", allRooms.size());

            // Preload all seats for all rooms to avoid repeated queries
            Map<Long, List<Seat>> roomSeatsMap = new HashMap<>();
            Query allSeatsQuery = entityManager.createQuery("SELECT s FROM Seat s WHERE s.isDeleted = false");
            List<Seat> allSeats = allSeatsQuery.getResultList();

            for (Seat seat : allSeats) {
                Long roomId = seat.getRoom().getId();
                if (!roomSeatsMap.containsKey(roomId)) {
                    roomSeatsMap.put(roomId, new ArrayList<>());
                }
                roomSeatsMap.get(roomId).add(seat);
            }
            log.info("Preloaded seats for {} rooms", roomSeatsMap.size());

            // Check existing schedules to avoid duplicates
            Query existingSchedulesQuery = entityManager.createQuery(
                    "SELECT NEW map(m.id as movieId, s.date as date, s.timeStart as time, s.id as id) " +
                    "FROM Schedule s JOIN s.movie m " +
                    "WHERE m.id IN :movieIds AND s.date IN :dates AND s.isDeleted = false");
            existingSchedulesQuery.setParameter("movieIds", showingMovies.stream()
                    .map(Movie::getId).collect(Collectors.toList()));
            existingSchedulesQuery.setParameter("dates", Arrays.asList(datesToProcess));

            // Create a map of existing schedules for quick lookup
            Map<String, Long> existingSchedules = new HashMap<>();
            List<Map<String, Object>> existingSchedulesList = existingSchedulesQuery.getResultList();
            for (Map<String, Object> schedule : existingSchedulesList) {
                String key = schedule.get("movieId") + "-" + schedule.get("date") + "-" + schedule.get("time");
                existingSchedules.put(key, (Long) schedule.get("id"));
            }
            log.info("Found {} existing schedules", existingSchedules.size());

            // Check existing showtimes to avoid duplicates
            Query existingShowtimesQuery = entityManager.createQuery(
                    "SELECT NEW map(st.id.scheduleId as scheduleId, st.id.roomId as roomId) " +
                    "FROM Showtime st WHERE st.isDeleted = false");

            // Create a set of existing showtimes for quick lookup
            Set<String> existingShowtimes = new HashSet<>();
            List<Map<String, Object>> existingShowtimesList = existingShowtimesQuery.getResultList();
            for (Map<String, Object> showtime : existingShowtimesList) {
                String key = showtime.get("scheduleId") + "-" + showtime.get("roomId");
                existingShowtimes.add(key);
            }
            log.info("Found {} existing showtimes", existingShowtimes.size());

            // Prepare batch processing
            int batchSize = 100;
            List<Object> batchEntities = new ArrayList<>(batchSize);
            AtomicInteger totalShowtimesCreated = new AtomicInteger(0);
            AtomicInteger totalSeatsCreated = new AtomicInteger(0);
            List<String> operationLog = Collections.synchronizedList(new ArrayList<>());

            // Process all movies in parallel
            showingMovies.parallelStream().forEach(movie -> {
                log.info("Processing movie: {} (ID: {})", movie.getName(), movie.getId());

                for (LocalDate date : datesToProcess) {
                    for (LocalTime time : times) {
                        // Generate a key for quick lookup
                        String scheduleKey = movie.getId() + "-" + date + "-" + time;

                        // Get or create schedule
                        Schedule schedule;
                        Long scheduleId = existingSchedules.get(scheduleKey);

                        if (scheduleId != null) {
                            // Use existing schedule
                            synchronized (this) {
                                schedule = entityManager.find(Schedule.class, scheduleId);
                            }
                            log.info("Found existing schedule (ID: {}) for movie {} on {} at {}",
                                    scheduleId, movie.getName(), date, time);
                        } else {
                            // Create new schedule
                            schedule = new Schedule();
                            schedule.setMovie(movie);
                            schedule.setDate(date);
                            schedule.setTimeStart(time);
                            schedule.setIsDeleted(false);

                            synchronized (this) {
                                entityManager.persist(schedule);
                                entityManager.flush(); // Ensure ID is assigned
                            }

                            log.info("Created new schedule (ID: {}) for movie {} on {} at {}",
                                    schedule.getId(), movie.getName(), date, time);
                        }

                        // Process rooms for this schedule
                        for (Room room : allRooms) {
                            String showtimeKey = schedule.getId() + "-" + room.getId();
                            if (!existingShowtimes.contains(showtimeKey)) {
                                Showtime showtime = new Showtime();
                                ShowtimeId showtimeId = new ShowtimeId();
                                showtimeId.setScheduleId(schedule.getId());
                                showtimeId.setRoomId(room.getId());

                                showtime.setId(showtimeId);
                                showtime.setSchedule(schedule);
                                showtime.setRoom(room);
                                showtime.setFormat(room.getRoomType() != null ? room.getRoomType().toString() : "2D");
                                showtime.setIsDeleted(false);

                                synchronized (this) {
                                    entityManager.persist(showtime);
                                }

                                totalShowtimesCreated.incrementAndGet();
                                operationLog.add(String.format("CREATED Showtime - Movie: %s, Date: %s, Time: %s, Room: %s (ID: %d)",
                                        movie.getName(), date, time, room.getName(), room.getId()));

                                List<Seat> seatsInRoom = roomSeatsMap.get(room.getId());
                                if (seatsInRoom != null) {
                                    List<ShowtimeSeat> newShowtimeSeatsToPersist = new ArrayList<>();
                                    for (Seat seat : seatsInRoom) {
                                        // CHECK IF ShowtimeSeat ALREADY EXISTS
                                        ShowtimeSeat existingShowtimeSeat = null;
                                        try {
                                            Query findExistingSeatQuery = entityManager.createQuery(
                                                    "SELECT ss FROM ShowtimeSeat ss WHERE ss.showtime.id.scheduleId = :scheduleId AND ss.showtime.id.roomId = :roomId AND ss.seat.id = :seatId");
                                            findExistingSeatQuery.setParameter("scheduleId", schedule.getId());
                                            findExistingSeatQuery.setParameter("roomId", room.getId());
                                            findExistingSeatQuery.setParameter("seatId", seat.getId());
                                            existingShowtimeSeat = (ShowtimeSeat) findExistingSeatQuery.getSingleResult();
                                        } catch (jakarta.persistence.NoResultException nre) {
                                            // This is expected if the seat doesn't exist for this showtime yet
                                        }

                                        if (existingShowtimeSeat == null) {
                                            ShowtimeSeat showtimeSeat = new ShowtimeSeat();
                                            showtimeSeat.setShowtime(showtime); // Use the showtime entity just persisted or found
                                            showtimeSeat.setSeat(seat);
                                            showtimeSeat.setStatus(StatusSeat.AVAILABLE);

                                            double basePrice = 75000;
                                            if (seat.getTypeSeat() == TypeSeat.VIP) {
                                                basePrice *= 1.5;
                                            } else if (seat.getTypeSeat() == TypeSeat.DOUBLE) {
                                                basePrice *= 2.2;
                                            }
                                            if (date.getDayOfWeek().getValue() >= 5) { // Friday, Saturday, Sunday
                                                basePrice += 15000;
                                            }
                                            showtimeSeat.setPrice(basePrice);
                                            newShowtimeSeatsToPersist.add(showtimeSeat);
                                            totalSeatsCreated.incrementAndGet();
                                        } else {
                                            log.warn("SKIPPED ShowtimeSeat - Already exists for Movie: {}, Date: {}, Time: {}, Room: {}, Seat: {}. Status: {}",
                                                    movie.getName(), date, time, room.getName(), seat.getId(), existingShowtimeSeat.getStatus());
                                        }
                                    }

                                    if (!newShowtimeSeatsToPersist.isEmpty()) {
                                        synchronized (batchEntities) {
                                            batchEntities.addAll(newShowtimeSeatsToPersist);
                                            if (batchEntities.size() >= batchSize) {
                                                flushBatch(batchEntities);
                                            }
                                        }
                                    }
                                }
                            } else {
                                log.info("Showtime already exists for scheduleId: {} and roomId: {}",
                                        schedule.getId(), room.getId());
                                operationLog.add(String.format("SKIPPED Showtime - Already exists for Movie: %s, Date: %s, Time: %s, Room: %s",
                                        movie.getName(), date, time, room.getName()));
                            }
                        }
                    }
                }
            });

            // Final batch flush
            if (!batchEntities.isEmpty()) {
                flushBatch(batchEntities);
            }

            long endTime = System.currentTimeMillis();
            log.info("Finished creating showtimes in {} ms. Created {} showtimes with {} seats",
                    (endTime - startTime), totalShowtimesCreated.get(), totalSeatsCreated.get());

            if (operationLog.isEmpty()) {
                return ResponseEntity.ok(new ApiResponse<>("No new showtimes were added. All were already existing.", operationLog));
            } else {
                return ResponseEntity.ok(new ApiResponse<>("Successfully added showtimes for active movies.", operationLog));
            }

        } catch (Exception e) {
            log.error("Error creating showtimes: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ApiResponse<>("Error creating showtimes: " + e.getMessage(), null));
        }
    }

    // Helper method to flush batch entities
    private void flushBatch(List<Object> entities) {
        if (!entities.isEmpty()) {
            try {
                for (Object entity : entities) {
                    entityManager.persist(entity);
                }
                entityManager.flush();
                entities.clear();
            } catch (Exception e) {
                log.error("Error during batch flush: {}", e.getMessage(), e);
            }
        }
    }

    // Thêm API endpoint mới để lấy thông tin seat layout
    @GetMapping("/seats/layout")
    public ResponseEntity<ApiResponse<?>> getSeatLayout(
            @RequestParam Long scheduleId,
            @RequestParam Long roomId,
            DomainUserDetails domainUserDetails) {
        log.info("Getting seat layout for scheduleId: {} and roomId: {}", scheduleId, roomId);
        try {
            // Lấy thông tin chi tiết showtime bằng service đã có
            ShowtimeDetailResponse showtimeDetail = showtimeService.getShowtimeDetail(scheduleId, roomId);

            // Lấy danh sách ghế từ ShowtimeDetailResponse
            List<ShowtimeDetailResponse.SeatInfo> seats = showtimeDetail.getSeats();
            Long userId = domainUserDetails.getUserId();
            Long seatId = 0L;
            //Loop seatId
            for (ShowtimeDetailResponse.SeatInfo seat : seats) {
                seatId = seat.getId();
                String seatKey = String.format("%d-%d-%d", roomId, scheduleId, seatId);
                Map<String, Object> cached = cacheSeatService.get(seatKey);
                if (cached != null) {
                    // Ghế này đang được giữ tạm thời
                    seat.setStatus(StatusSeat.SELECTED);
                    seat.setUserId((Long) cached.get("userId"));
                }
            }

            log.info("Successfully retrieved seat layout with {} seats", seats.size());

            return ResponseEntity.ok(
                    new ApiResponse<>("Successfully retrieved seat layout", seats)
            );
        } catch (AppException e) {
            log.error("AppException getting seat layout: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error getting seat layout: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Error retrieving seat layout: " + e.getMessage(), null));
        }
    }

    @PostMapping()
    public ResponseEntity<ApiResponse<?>> createShowtime(@RequestBody ShowtimeForCreateRequest request) {
        showtimeService.createShowtime(request);
        return ResponseEntity.ok(new ApiResponse<>("Successfully create showtime"));
    }
}