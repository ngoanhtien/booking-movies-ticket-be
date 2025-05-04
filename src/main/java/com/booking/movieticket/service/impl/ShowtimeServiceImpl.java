package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.response.BranchWithShowtimesDTO;
import com.booking.movieticket.dto.response.ShowtimeDTO;
import com.booking.movieticket.dto.response.ShowtimeDetailResponse;
import com.booking.movieticket.dto.response.ShowtimeResponse;
import com.booking.movieticket.entity.*;
import com.booking.movieticket.entity.compositekey.ShowtimeId;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.repository.MovieRepository;
import com.booking.movieticket.repository.ScheduleRepository;
import com.booking.movieticket.repository.ShowtimeRepository;
import com.booking.movieticket.repository.ShowtimeSeatRepository;
import com.booking.movieticket.service.ShowtimeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
public class ShowtimeServiceImpl implements ShowtimeService {

    ShowtimeRepository showtimeRepository;
    ScheduleRepository scheduleRepository;
    MovieRepository movieRepository;
    ShowtimeSeatRepository showtimeSeatRepository;

    @Override
    @Transactional(readOnly = true)
    public ShowtimeResponse getShowtimesByMovieAndDate(Long movieId, LocalDate date) {
        try {
            Movie movie = findMovieById(movieId);
            // Get showtimes for the movie on the specified date
            List<Showtime> showtimes = showtimeRepository.findByMovieIdAndDateOrderByBranchAndTime(movieId, date);
            return buildShowtimeResponse(movie, showtimes);
        } catch (AppException e) {
            log.error("AppException fetching showtimes by date: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error fetching showtimes by date: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                    "Error fetching showtimes for movie: " + movieId + " on date: " + date);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ShowtimeResponse getShowtimesByMovieAndDateAndCinema(Long movieId, LocalDate date, Long cinemaId) {
        try {
            log.info("Starting to fetch showtimes for movie ID: {} on date: {} {}",
                    movieId, date, cinemaId != null ? "with cinema ID: " + cinemaId : "for all cinemas");

            Movie movie = findMovieById(movieId);

            // Get showtimes for the movie on the specified date, optionally filtered by cinema
            List<Showtime> showtimes = showtimeRepository.findByMovieIdAndDateAndCinemaIdOrderByBranchAndTime(
                    movieId, date, cinemaId);

            log.info("Found {} showtimes for movie on date {} {}",
                    showtimes.size(), date,
                    cinemaId != null ? "at cinema ID: " + cinemaId : "across all cinemas");

            // Debug: Log details of each showtime
            if (showtimes.isEmpty()) {
                log.warn("No showtimes found for the specified criteria");
            } else {
                for (Showtime showtime : showtimes) {
                    log.debug("Showtime: scheduleId={}, roomId={}, date={}, time={}, branch={}, cinema={}",
                            showtime.getId().getScheduleId(),
                            showtime.getId().getRoomId(),
                            showtime.getSchedule().getDate(),
                            showtime.getSchedule().getTimeStart(),
                            showtime.getRoom().getBranch().getName(),
                            showtime.getRoom().getBranch().getCinema().getName());
                }
            }

            // Process and return the response
            ShowtimeResponse response = buildShowtimeResponse(movie, showtimes);
            log.info("Built response with {} branches", response.getBranches().size());
            return response;
        } catch (AppException e) {
            log.error("AppException fetching showtimes by date and cinema: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                    "Error fetching showtimes for movie: " + movieId + " on date: " + date +
                            (cinemaId != null ? " and cinema: " + cinemaId : ""));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocalDate> getAvailableDatesByMovie(Long movieId) {
        try {
            // Verify the movie exists
            findMovieById(movieId);

            // Get available dates
            return scheduleRepository.findAvailableDatesByMovieId(movieId);
        } catch (AppException e) {
            log.error("AppException fetching available dates: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error fetching available dates: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                    "Error fetching available dates for movie: " + movieId);
        }
    }

    /**
     * Helper method to find a movie by ID
     */
    private Movie findMovieById(Long movieId) {
        return movieRepository.findById(movieId)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND,
                        "Movie not found with ID: " + movieId));
    }

    /**
     * Helper method to build the ShowtimeResponse from a movie and a list of showtimes
     */
    private ShowtimeResponse buildShowtimeResponse(Movie movie, List<Showtime> showtimes) {
        if (showtimes.isEmpty()) {
            return ShowtimeResponse.builder()
                    .movieId(movie.getId())
                    .movieName(movie.getName())
                    .imageUrl(movie.getImageSmallUrl())
                    .duration(movie.getDuration())
                    .summary(movie.getSummary())
                    .director(movie.getDirector())
                    .ageLimit(movie.getAgeLimit())
                    .branches(Collections.emptyList())
                    .build();
        }

        // Group showtimes by branch
        Map<Long, List<Showtime>> showtimesByBranch = showtimes.stream()
                .collect(Collectors.groupingBy(showtime -> showtime.getRoom().getBranch().getId()));

        // Convert to BranchWithShowtimesDTO list
        List<BranchWithShowtimesDTO> branchDTOs = showtimesByBranch.entrySet().stream()
                .map(entry -> {
                    Long branchId = entry.getKey();
                    List<Showtime> branchShowtimes = entry.getValue();

                    // Get branch info from the first showtime
                    Showtime firstShowtime = branchShowtimes.get(0);

                    // Convert showtimes to DTOs
                    List<ShowtimeDTO> showtimeDTOs = branchShowtimes.stream()
                            .map(showtime -> convertToShowtimeDTO(showtime, movie.getDuration()))
                            .collect(Collectors.toList());

                    return BranchWithShowtimesDTO.builder()
                            .branchId(branchId)
                            .branchName(firstShowtime.getRoom().getBranch().getName())
                            .address(firstShowtime.getRoom().getBranch().getAddress())
                            .hotline(firstShowtime.getRoom().getBranch().getHotline())
                            .imageUrl(firstShowtime.getRoom().getBranch().getImageUrl())
                            .showtimes(showtimeDTOs)
                            .build();
                })
                .collect(Collectors.toList());

        // Create and return the response
        return ShowtimeResponse.builder()
                .movieId(movie.getId())
                .movieName(movie.getName())
                .imageUrl(movie.getImageSmallUrl())
                .duration(movie.getDuration())
                .summary(movie.getSummary())
                .director(movie.getDirector())
                .ageLimit(movie.getAgeLimit())
                .branches(branchDTOs)
                .build();
    }

    /**
     * Helper method to convert a Showtime entity to a ShowtimeDTO
     * Calculates the end time based on the start time and movie duration
     */
    private ShowtimeDTO convertToShowtimeDTO(Showtime showtime, Integer movieDuration) {
        LocalTime startTime = showtime.getSchedule().getTimeStart();
        LocalTime endTime = startTime.plusMinutes(movieDuration);

        return ShowtimeDTO.builder()
                .scheduleId(showtime.getId().getScheduleId())
                .roomId(showtime.getId().getRoomId())
                .roomName(showtime.getRoom().getName())
                .roomType(showtime.getRoom().getRoomType().toString())
                .scheduleDate(showtime.getSchedule().getDate())
                .scheduleTime(startTime)
                .scheduleEndTime(endTime)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ShowtimeDetailResponse getShowtimeDetail(Long scheduleId, Long roomId) {
        try {
            log.info("Fetching showtime detail for scheduleId: {} and roomId: {}", scheduleId, roomId);

            // Create composite key
            ShowtimeId showtimeId = new ShowtimeId(scheduleId, roomId);

            // Find the showtime
            Showtime showtime = showtimeRepository.findById(showtimeId)
                    .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND,
                            "Showtime not found for scheduleId: " + scheduleId + " and roomId: " + roomId));

            // Get related entities
            Schedule schedule = showtime.getSchedule();
            Room room = showtime.getRoom();
            Movie movie = schedule.getMovie();

            // Get all seats for this showtime
            List<ShowtimeSeat> showtimeSeats = showtimeSeatRepository.findByShowtime(showtime);

            // Calculate end time based on movie duration
            LocalTime startTime = schedule.getTimeStart();
            LocalTime endTime = startTime.plusMinutes(movie.getDuration());

            // Build the response
            ShowtimeDetailResponse response = ShowtimeDetailResponse.builder()
                    .showtime(new ShowtimeDetailResponse.ShowtimeIdentifier(scheduleId, roomId))
                    .movie(ShowtimeDetailResponse.MovieInfo.builder()
                            .id(movie.getId())
                            .name(movie.getName())
                            .duration(movie.getDuration())
                            .ageLimit(movie.getAgeLimit())
                            .language(movie.getLanguage())
                            .imageUrl(movie.getImageSmallUrl())
                            .build())
                    .schedule(ShowtimeDetailResponse.ScheduleInfo.builder()
                            .id(schedule.getId())
                            .date(schedule.getDate())
                            .timeStart(startTime)
                            .timeEnd(endTime)
                            .build())
                    .room(ShowtimeDetailResponse.RoomInfo.builder()
                            .id(room.getId())
                            .name(room.getName())
                            .roomType(room.getRoomType())
                            .seatRowNumbers(room.getSeatRowNumbers())
                            .seatColumnNumbers(room.getSeatColumnNumbers())
                            .aislePosition(room.getAislePosition())
                            .branchName(room.getBranch().getName())
                            .build())
                    .build();

            // Convert seats
            List<ShowtimeDetailResponse.SeatInfo> seatInfos = showtimeSeats.stream()
                    .map(showtimeSeat -> {
                        Seat seat = showtimeSeat.getSeat();
                        return ShowtimeDetailResponse.SeatInfo.builder()
                                .id(seat.getId())
                                .rowName(seat.getRowName())
                                .columnName(seat.getColumnName())
                                .rowScreenLabel(seat.getRowScreenLabel())
                                .columnScreenLabel(seat.getColumnScreenLabel())
                                .typeSeat(seat.getTypeSeat())
                                .status(showtimeSeat.getStatus())
                                .price(showtimeSeat.getPrice())
                                .build();
                    })
                    .collect(Collectors.toList());

            response.setSeats(seatInfos);
            log.info("Found {} seats for showtime", seatInfos.size());

            return response;
        } catch (AppException e) {
            log.error("AppException fetching showtime detail: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error fetching showtime detail: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                    "Error fetching showtime detail for scheduleId: " + scheduleId + " and roomId: " + roomId);
        }
    }
}