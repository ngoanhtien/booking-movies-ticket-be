package com.booking.movieticket.controller;

import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.ShowtimeDetailResponse;
import com.booking.movieticket.dto.response.ShowtimeResponse;
import com.booking.movieticket.service.ShowtimeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.persistence.Query;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import com.booking.movieticket.entity.Movie;
import com.booking.movieticket.entity.Room;
import com.booking.movieticket.entity.Schedule;
import com.booking.movieticket.entity.Seat;
import com.booking.movieticket.entity.Showtime;
import com.booking.movieticket.entity.ShowtimeSeat;
import com.booking.movieticket.entity.compositekey.ShowtimeId;
import com.booking.movieticket.entity.enums.StatusSeat;
import com.booking.movieticket.entity.enums.StatusMovie;
import com.booking.movieticket.entity.enums.TypeSeat;

@Slf4j
@RestController
@RequestMapping("/showtime")
@CrossOrigin(origins = "*")
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    @Autowired
    private EntityManager entityManager;

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
     * @param movieId ID of the movie
     * @param date Date for which to retrieve showtimes (format: yyyy-MM-dd)
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
     * @param movieId ID of the movie
     * @param date Date for which to retrieve showtimes (format: yyyy-MM-dd)
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
     * Get detailed information for a specific showtime, including seat layout
     * @param scheduleId ID of the schedule
     * @param roomId ID of the room
     * @return API response with detailed showtime information including seat layout
     */
    @GetMapping("/{scheduleId}/{roomId}/detail")
    public ResponseEntity<ApiResponse<?>> getShowtimeDetail(
            @PathVariable Long scheduleId,
            @PathVariable Long roomId) {
        log.info("Fetching detailed information for showtime with scheduleId: {} and roomId: {}", scheduleId, roomId);
        ShowtimeDetailResponse detailResponse = showtimeService.getShowtimeDetail(scheduleId, roomId);
        return ResponseEntity.ok(new ApiResponse<>(
                "Successfully retrieved showtime details", detailResponse));
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

                            if (count == 0) { // Chỉ tạo nếu chưa tồn tại
                                Showtime showtime = new Showtime();
                                ShowtimeId showtimeId = new ShowtimeId();
                                showtimeId.setScheduleId(schedule.getId());
                                showtimeId.setRoomId(roomId);
                                
                                showtime.setId(showtimeId);
                                showtime.setSchedule(schedule);
                                showtime.setRoom(room);
                                showtime.setFormat(room.getRoomType().toString());
                                showtime.setIsDeleted(false);
                                
                                // Lưu showtime
                                entityManager.persist(showtime);
                                
                                // Lấy tất cả ghế trong phòng
                                Query seatQuery = entityManager.createQuery("SELECT s FROM Seat s WHERE s.room.id = :roomId");
                                seatQuery.setParameter("roomId", roomId);
                                List<Seat> seats = seatQuery.getResultList();
                                
                                // Tạo showtime_seats cho tất cả ghế trong phòng
                                for (Seat seat : seats) {
                                    ShowtimeSeat showtimeSeat = new ShowtimeSeat();
                                    showtimeSeat.setShowtime(showtime);
                                    showtimeSeat.setSeat(seat);
                                    showtimeSeat.setStatus(StatusSeat.AVAILABLE);
                                    
                                    // Tính giá dựa vào loại ghế
                                    double basePrice = 100000; // Giá vé cơ bản
                                    // Ví dụ: Thêm phụ phí cho các loại ghế khác nhau hoặc dựa trên lịch chiếu
                                    if (seat.getTypeSeat() == TypeSeat.VIP) {
                                        basePrice += 20000; // Phụ phí ghế VIP
                                    } else if (seat.getTypeSeat() == TypeSeat.DOUBLE) {
                                        basePrice += 40000; // Phụ phí ghế đôi
                                    }
                                    // Có thể thêm logic giá thay đổi theo ngày/giờ chiếu ở đây
                                    
                                    showtimeSeat.setPrice(basePrice);
                                    
                                    // Lưu showtime_seat
                                    entityManager.persist(showtimeSeat);
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
    @GetMapping("/public/add-showtimes-for-active-movies")
    @Transactional
    public ResponseEntity<ApiResponse<?>> addShowtimesForActiveMoviesPublic() {
        log.info("Attempting to call /showtime/public/add-showtimes-for-active-movies - STEP 1: UNCOMMENTING MOVIE FETCH");
        
        try {
            // Lấy danh sách phim SHOWING (thay vì 'ACTIVE')
            Query query = entityManager.createQuery("SELECT m FROM Movie m WHERE m.status = :status");
            query.setParameter("status", StatusMovie.SHOWING); 
            List<Movie> showingMovies = query.getResultList();
            
            if (showingMovies.isEmpty()) {
                log.warn("No movies currently in 'SHOWING' status found during STEP 1");
                return ResponseEntity.ok(new ApiResponse<>("No movies currently in 'SHOWING' status found", null));
            }
            log.info("STEP 1 COMPLETE: Fetched {} movies in 'SHOWING' status", showingMovies.size());

            LocalDate today = LocalDate.now();
            LocalDate tomorrow = today.plusDays(1);
            
            // Danh sách thời gian chiếu (ví dụ)
            LocalTime[] times = {
                LocalTime.of(10, 0), // Sáng
                LocalTime.of(13, 30), // Chiều
                LocalTime.of(17, 0),  // Tối
                LocalTime.of(20, 30)  // Tối muộn
            };
            
            // Lấy danh sách tất cả các phòng chiếu có sẵn (ví dụ)
            // Trong thực tế, bạn có thể muốn lấy phòng theo cụm rạp hoặc cấu hình khác
            Query roomQuery = entityManager.createQuery("SELECT r FROM Room r WHERE r.isDeleted = false");
            List<Room> allRooms = roomQuery.getResultList();

            if (allRooms.isEmpty()) {
                log.warn("No active rooms found in the system.");
                return ResponseEntity.ok(new ApiResponse<>("No active rooms found. Cannot create showtimes.", null));
            }
            log.info("Found {} active rooms.", allRooms.size());
            
            List<String> operationLog = new ArrayList<>();
            
            log.info("STEP 2: UNCOMMENTING DATE AND TIME LOOP");
            // Tạo lịch chiếu cho hôm nay và ngày mai
            for (Movie movie : showingMovies) {
                log.info("  Processing movie: {} (ID: {})", movie.getName(), movie.getId());
                for (LocalDate date : new LocalDate[]{today, tomorrow}) {
                    log.info("    Processing date: {}", date);
                    for (LocalTime time : times) {
                        log.info("      Processing time: {}", time);
                        // Tìm hoặc tạo schedule
                        Schedule schedule;
                        Query scheduleQuery = entityManager.createQuery(
                            "SELECT s FROM Schedule s WHERE s.movie.id = :movieId AND s.date = :date AND s.timeStart = :timeStart");
                        scheduleQuery.setParameter("movieId", movie.getId());
                        scheduleQuery.setParameter("date", date);
                        scheduleQuery.setParameter("timeStart", time);
                        
                        List<Schedule> existingSchedules = scheduleQuery.getResultList();
                        if (!existingSchedules.isEmpty()) {
                            schedule = existingSchedules.get(0);
                            log.info("        Found existing schedule (ID: {}) for movie {} on {} at {}", schedule.getId(), movie.getName(), date, time);
                            if (schedule.getIsDeleted() == null || schedule.getIsDeleted()) {
                                schedule.setIsDeleted(false); // Reactivate if it was soft-deleted
                                entityManager.merge(schedule);
                                log.info("        Reactivated schedule (ID: {})", schedule.getId());
                            }
                        } else {
                            schedule = new Schedule();
                            schedule.setMovie(movie);
                            schedule.setDate(date);
                            schedule.setTimeStart(time);
                            schedule.setIsDeleted(false);
                            entityManager.persist(schedule);
                            log.info("        Created new schedule (ID: {}) for movie {} on {} at {}", schedule.getId(), movie.getName(), date, time);
                        }
                        
                        log.info("STEP 3: UNCOMMENTING ROOM LOOP AND SHOWTIME CREATION");
                        // Tạo showtime cho mỗi phòng
                        for (Room room : allRooms) {
                            log.info("        Processing roomId: {}", room.getId());
                             // KIỂM TRA SỰ TỒN TẠI CỦA SHOWTIME
                            Query checkShowtimeQuery = entityManager.createQuery(
                                "SELECT COUNT(st) FROM Showtime st WHERE st.schedule.id = :scheduleId AND st.room.id = :roomId");
                            checkShowtimeQuery.setParameter("scheduleId", schedule.getId());
                            checkShowtimeQuery.setParameter("roomId", room.getId());
                            Long showtimeCount = (Long) checkShowtimeQuery.getSingleResult();

                            if (showtimeCount == 0) { // Chỉ tạo nếu chưa tồn tại
                                Showtime showtime = new Showtime();
                                ShowtimeId showtimeId = new ShowtimeId();
                                showtimeId.setScheduleId(schedule.getId());
                                showtimeId.setRoomId(room.getId());
                                
                                showtime.setId(showtimeId);
                                showtime.setSchedule(schedule);
                                showtime.setRoom(room);
                                // Định dạng phim có thể dựa trên loại phòng hoặc thông tin phim
                                showtime.setFormat(room.getRoomType() != null ? room.getRoomType().toString() : "2D"); 
                                showtime.setIsDeleted(false);
                                
                                entityManager.persist(showtime);
                                operationLog.add(String.format("CREATED Showtime - Movie: %s, Date: %s, Time: %s, Room: %s (ID: %d), ScheduleID: %d", 
                                    movie.getName(), date, time, room.getName(), room.getId(), schedule.getId()));
                                log.info("          Successfully persisted showtime for scheduleId: {}, roomId: {}", schedule.getId(), room.getId());

                                // Tạo showtime_seats cho tất cả ghế trong phòng
                                Query seatInRoomQuery = entityManager.createQuery("SELECT s FROM Seat s WHERE s.room.id = :roomId AND s.isDeleted = false");
                                seatInRoomQuery.setParameter("roomId", room.getId());
                                List<Seat> seatsInRoom = seatInRoomQuery.getResultList();
                                log.info("            Found {} seats for room: {}", seatsInRoom.size(), room.getName());

                                for (Seat seat : seatsInRoom) {
                                    ShowtimeSeat showtimeSeat = new ShowtimeSeat();
                                    showtimeSeat.setShowtime(showtime);
                                    showtimeSeat.setSeat(seat);
                                    showtimeSeat.setStatus(StatusSeat.AVAILABLE);
                                    
                                    // Logic giá vé (ví dụ)
                                    double basePrice = 75000; // Sử dụng giá cố định vì Movie entity không có getBasePrice()
                                    if (seat.getTypeSeat() == TypeSeat.VIP) {
                                        basePrice *= 1.5; // VIP đắt hơn 50%
                                    } else if (seat.getTypeSeat() == TypeSeat.DOUBLE) { // Sửa SWEETBOX thành DOUBLE
                                        basePrice *= 2.2; // Ghế đôi cho 2 người
                                    }
                                    // Thêm logic phụ thu cuối tuần/giờ vàng nếu cần
                                    if (date.getDayOfWeek().getValue() >= 5) { // Thứ 6, 7, CN
                                        basePrice += 15000; // Phụ thu cuối tuần
                                    }

                                    showtimeSeat.setPrice(basePrice);
                                    entityManager.persist(showtimeSeat);
                                }
                                log.info("            Successfully created {} showtime seats for showtime (ScheduleId: {}, RoomId: {})", seatsInRoom.size(), schedule.getId(), room.getId());
                            } else {
                                operationLog.add(String.format("SKIPPED Showtime - Already exists for Movie: %s, Date: %s, Time: %s, Room: %s (ID: %d), ScheduleID: %d",
                                    movie.getName(), date, time, room.getName(), room.getId(), schedule.getId()));
                                log.info("          SKIPPED - Showtime already exists for scheduleId: {} and roomId: {}", schedule.getId(), room.getId());
                            }
                        }
                    }
                }
            }
            
            // Trả về response cuối cùng khi tất cả logic đã được bỏ comment và (hy vọng) chạy thành công
            if (operationLog.isEmpty()) {
                log.warn("No showtimes were added. This might be due to no rooms found or other issues within the loop.");
                return ResponseEntity.ok(new ApiResponse<>("SUCCESS - STEP 5: All logic executed, but no showtimes were effectively added. Check logs.", operationLog));
            } else {
                return ResponseEntity.ok(new ApiResponse<>("SUCCESS - STEP 5: All logic executed. Showtimes should be added.", operationLog));
            }

        } catch (Exception e) {
            log.error("Error during STEP 5 (Showtime/ShowtimeSeat persistence): {} Trace: {}", e.getMessage(), e.getStackTrace()); 
            return ResponseEntity.ok(new ApiResponse<>("Error during STEP 5 (Showtime/ShowtimeSeat persistence): " + e.getMessage(), null));
        }
    }
}