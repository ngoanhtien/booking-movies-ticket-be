package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.request.BookingRequest;
import com.booking.movieticket.dto.response.BookingResponse;
import com.booking.movieticket.dto.response.BookingHistoryResponse;
import com.booking.movieticket.entity.*;
import com.booking.movieticket.entity.compositekey.BillFoodId;
import com.booking.movieticket.entity.compositekey.ShowtimeId;
import com.booking.movieticket.entity.enums.StatusBill;
import com.booking.movieticket.entity.enums.StatusSeat;
import com.booking.movieticket.entity.enums.BookingStatus;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.repository.*;
import com.booking.movieticket.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;
    private final BillRepository billRepository;
    private final FoodRepository foodRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest bookingRequest) {
        log.info("========= START CREATE BOOKING PROCESS FOR USER ID: {} =========", userId);
        log.debug("BookingRequest: {}", bookingRequest);
        try {
            log.info("Fetching User with ID: {}", userId);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        log.error("CRITICAL: User not found with ID: {}", userId);
                        return new AppException(ErrorCode.USER_NOT_FOUND);
                    });
            log.info("User {} found.", user.getEmail());

            ShowtimeId showtimeId = new ShowtimeId(bookingRequest.getScheduleId(), bookingRequest.getRoomId());
            log.info("Fetching Showtime with Schedule ID: {} and Room ID: {}", bookingRequest.getScheduleId(), bookingRequest.getRoomId());
            Showtime showtime = showtimeRepository.findById(showtimeId)
                    .orElseThrow(() -> {
                        log.error("CRITICAL: Showtime not found with scheduleId: {} and roomId: {}",
                            bookingRequest.getScheduleId(), bookingRequest.getRoomId());
                        return new AppException(ErrorCode.SHOWTIME_NOT_FOUND);
                    });
            log.info("Showtime found for Movie: {}", showtime.getSchedule().getMovie().getName());

            Schedule schedule = showtime.getSchedule();
            Room room = showtime.getRoom();
            Movie movie = schedule.getMovie();
            Branch branch = room.getBranch();

            log.info("Retrieving selected ShowtimeSeats...");
            List<Long> selectedShowtimeSeatIds = bookingRequest.getSeatIds();
            List<ShowtimeSeat> seatsToBook = showtimeSeatRepository.findAllByIdsForUpdate(selectedShowtimeSeatIds);
            
            // NEW LOGGING: Check if all seats were found
            log.info("Found {} seats out of {} requested", seatsToBook.size(), selectedShowtimeSeatIds.size());
            
            if (seatsToBook.size() != selectedShowtimeSeatIds.size()) {
                log.error("CRITICAL: Not all requested seats were found. Requested: {}, Found: {}", selectedShowtimeSeatIds.size(), seatsToBook.size());
                throw new AppException(ErrorCode.SHOWTIMESEAT_NOT_FOUND);
            }

            // Validate that all seats are available
            log.info("Validating seat availability...");
            for (ShowtimeSeat seat : seatsToBook) {
                if (seat.getStatus() != StatusSeat.AVAILABLE) {
                    log.error("CRITICAL: Seat {} is not available. Current status: {}", seat.getId(), seat.getStatus());
                    throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED);
                }
                // NEW LOGGING: Check seat details
                log.debug("Seat ID: {}, Status: {}, Location: {}{}",
                    seat.getId(), seat.getStatus(), seat.getSeat().getRowName(), seat.getSeat().getColumnName());
            }
            log.info("All {} seats are available for booking.", seatsToBook.size());

            // Calculate total price
            double totalSeatPrice = 0;
            double totalFoodPrice = 0;

            log.info("Calculating seat prices...");
            for (ShowtimeSeat seat : seatsToBook) {
                totalSeatPrice += seat.getPrice();
                seat.setStatus(StatusSeat.BOOKED);
                log.debug("Marked seat {} as BOOKED, price: {}", seat.getId(), seat.getPrice());
            }
            log.info("Total seat price: {}", totalSeatPrice);

            log.info("Processing food items...");
            if (bookingRequest.getFoodItems() != null && !bookingRequest.getFoodItems().isEmpty()) {
                log.info("Food items found in request: {}", bookingRequest.getFoodItems().size());
                for (BookingRequest.FoodOrderItem foodItem : bookingRequest.getFoodItems()) {
                    Food food = foodRepository.findById(foodItem.getFoodId())
                            .orElseThrow(() -> {
                                log.error("CRITICAL: Food not found with ID: {}", foodItem.getFoodId());
                                return new AppException(ErrorCode.FOOD_NOT_FOUND);
                            });
                    totalFoodPrice += food.getPrice() * foodItem.getQuantity();
                    log.debug("Added food: {}, Quantity: {}, Price: {} x {} = {}", 
                        food.getName(), foodItem.getQuantity(), food.getPrice(), foodItem.getQuantity(), food.getPrice() * foodItem.getQuantity());
                }
                log.info("Total food price: {}", totalFoodPrice);
            } else {
                log.info("No food items in this booking request.");
            }
            double finalTotalAmount = totalSeatPrice + totalFoodPrice;
            log.info("Total seat price: {}, Total food price: {}, Final total amount: {}", totalSeatPrice, totalFoodPrice, finalTotalAmount);

            log.info("Creating new Booking entity...");
            Booking newBooking = new Booking();
            newBooking.setUser(user);
            newBooking.setShowtime(showtime);
            newBooking.setTotalAmount(finalTotalAmount);
            newBooking.setStatus(BookingStatus.CONFIRMED);
            newBooking.setBookingTime(LocalDateTime.now());
            newBooking.setBookingCode(generateBookingCode());
            newBooking.setPaymentMethod("CASH"); // For testing, set default payment method
            newBooking.setPaymentStatus("PAID"); // For testing, set default payment status
            log.debug("New Booking entity populated (pre-save): User={}, Showtime={}-{}. Code={}, Amount={}",
                user.getId(), showtime.getId().getScheduleId(), showtime.getId().getRoomId(), newBooking.getBookingCode(), finalTotalAmount);

            log.info("Linking {} ShowtimeSeats to the new Booking entity (in memory)...", seatsToBook.size());
            List<ShowtimeSeat> updatedShowtimeSeatsForBookingObject = new ArrayList<>();
            for (ShowtimeSeat seat : seatsToBook) {
                log.debug("Setting Booking object (pre-save Booking) for ShowtimeSeat ID: {}", seat.getId());
                seat.setBooking(newBooking);
                updatedShowtimeSeatsForBookingObject.add(seat);
                log.debug("ShowtimeSeat ID: {} now linked to Booking (in memory), Status: {}", seat.getId(), seat.getStatus());
            }
            newBooking.setShowtimeSeats(updatedShowtimeSeatsForBookingObject);
            log.info("{} ShowtimeSeats linked to Booking entity (in memory).", updatedShowtimeSeatsForBookingObject.size());

            // NEW LOGGING: Additional check before saving
            log.info("Pre-save verification: Booking has {} seats linked", 
                newBooking.getShowtimeSeats() != null ? newBooking.getShowtimeSeats().size() : 0);

            // Khai báo biến ở đây để có thể sử dụng bên ngoài khối try
            Booking savedBooking;
            List<ShowtimeSeat> savedSeats;
            
            log.info("Attempting to save Booking entity (ID will be generated by DB)...");
            try {
                savedBooking = bookingRepository.save(newBooking);
                log.info("SUCCESS: Booking entity saved. Generated Booking ID: {}, Booking Code: {}", savedBooking.getId(), savedBooking.getBookingCode());
                
                // NEW LOGGING: Check post-save relationship
                if (savedBooking.getShowtimeSeats() != null) {
                     log.info("Booking (ID: {}) after save has {} showtime seats associated in its list (due to cascade).", savedBooking.getId(), savedBooking.getShowtimeSeats().size());
                     for(ShowtimeSeat ss : savedBooking.getShowtimeSeats()){
                        log.debug("  Post-BookingSave: ShowtimeSeat ID {} has Booking FK (in memory): {}", ss.getId(), (ss.getBooking() != null ? ss.getBooking().getId() : "NULL"));
                     }
                } else {
                    log.warn("WARNING: savedBooking.getShowtimeSeats() returned NULL after save!");
                }
            } catch (Exception e) {
                log.error("CRITICAL ERROR saving booking: {}", e.getMessage(), e);
                throw e;
            }

            log.info("Attempting to save all {} updated ShowtimeSeat entities (this will persist Booking FK)...", updatedShowtimeSeatsForBookingObject.size());
            try {
                savedSeats = showtimeSeatRepository.saveAll(updatedShowtimeSeatsForBookingObject);
                log.info("SUCCESS: All {} ShowtimeSeat entities updated and saved.", savedSeats.size());
                for (ShowtimeSeat seat : savedSeats) {
                    log.info("  PERSISTED ShowtimeSeat ID: {}, Status: {}, Linked Booking ID (from seat.getBooking()): {}",
                        seat.getId(), seat.getStatus(), (seat.getBooking() != null ? seat.getBooking().getId() : "NULL"));
                }
            } catch (Exception e) {
                log.error("CRITICAL ERROR saving seats: {}", e.getMessage(), e);
                throw e;
            }

            log.info("Creating new Bill entity for Booking ID: {}...", savedBooking.getId());
            Bill bill = new Bill();
            bill.setBooking(savedBooking);
            bill.setUser(user);
            bill.setStatus(StatusBill.PAID);
            bill.setBillCode(savedBooking.getBookingCode());
            bill.setIsDeleted(false);
            log.debug("New Bill entity populated (pre-save): BookingID={}, UserID={}, BillCode={}",
                savedBooking.getId(), user.getId(), bill.getBillCode());

            log.info("Attempting to save Bill entity...");
            Bill savedBill = billRepository.save(bill);
            log.info("SUCCESS: Bill entity saved. Generated Bill ID: {}, Linked to Booking ID: {}", savedBill.getId(), savedBill.getBooking().getId());

            List<BookingResponse.FoodItem> foodItemsResponse = new ArrayList<>();
            if (bookingRequest.getFoodItems() != null && !bookingRequest.getFoodItems().isEmpty()) {
                log.info("Processing {} food items for the Bill ID: {}...", bookingRequest.getFoodItems().size(), savedBill.getId());
                for (BookingRequest.FoodOrderItem foodItemRequest : bookingRequest.getFoodItems()) {
                    Food food = foodRepository.findById(foodItemRequest.getFoodId())
                            .orElseThrow(() -> new AppException(ErrorCode.FOOD_NOT_FOUND));
                    Integer quantity = foodItemRequest.getQuantity();

                    BillFood billFood = new BillFood();
                    billFood.setId(new BillFoodId(savedBill.getId(), food.getId()));
                    billFood.setBill(savedBill);
                    billFood.setFood(food);
                    billFood.setQuantity(quantity);
                    billFood.setIsDeleted(false);
                    savedBill.getBillFoods().add(billFood);
                    log.debug("Populated BillFood (pre-save Bill again): BillID={}, FoodID={}, Qty={}", savedBill.getId(), food.getId(), quantity);
                    
                    foodItemsResponse.add(BookingResponse.FoodItem.builder()
                            .name(food.getName())
                            .quantity(quantity)
                            .price(food.getPrice() * quantity)
                            .build());
                }
                log.info("Attempting to save Bill (ID: {}) again to persist BillFoods...", savedBill.getId());
                billRepository.save(savedBill);
                log.info("SUCCESS: Bill (ID: {}) re-saved with {} BillFoods.", savedBill.getId(), savedBill.getBillFoods().size());
            } else {
                log.info("No food items in this booking request.");
            }

            log.info("Processing BillDetails for {} seats for Bill ID: {}...", updatedShowtimeSeatsForBookingObject.size(), savedBill.getId());
            for (ShowtimeSeat seat : updatedShowtimeSeatsForBookingObject) {
                BillDetail billDetail = new BillDetail();
                billDetail.setBill(savedBill);
                billDetail.setShowtimeSeat(seat);
                billDetail.setIsDeleted(false);
                savedBill.addBillDetail(billDetail);
                log.debug("Populated BillDetail (pre-save Bill again): BillID={}, ShowtimeSeatID={}", savedBill.getId(), seat.getId());
            }
            log.info("Attempting to save Bill (ID: {}) again to persist BillDetails...", savedBill.getId());
            billRepository.save(savedBill);
            log.info("SUCCESS: Bill (ID: {}) re-saved with {} BillDetails.", savedBill.getId(), savedBill.getBillDetails().size());

            log.info("Booking process completed successfully for Booking Code: {}. Preparing response...", savedBooking.getBookingCode());
            List<String> seatLabels = updatedShowtimeSeatsForBookingObject.stream()
                    .map(seat -> seat.getSeat().getRowName() + seat.getSeat().getColumnName())
                    .sorted()
                    .collect(Collectors.<String>toList());

            return BookingResponse.builder()
                    .bookingId(savedBooking.getId())
                    .bookingCode(savedBooking.getBookingCode())
                    .movie(BookingResponse.MovieInfo.builder()
                            .movieId(movie.getId())
                            .movieName(movie.getName())
                            .format(room.getRoomType())
                            .date(schedule.getDate())
                            .startTime(schedule.getTimeStart())
                            .endTime(schedule.getTimeStart().plusMinutes(movie.getDuration()))
                            .build())
                    .cinema(BookingResponse.CinemaInfo.builder()
                            .cinemaName(branch.getCinema().getName())
                            .roomName(room.getName())
                            .address(branch.getAddress())
                            .build())
                    .seats(seatLabels)
                    .totalAmount(finalTotalAmount)
                    .foodItems(foodItemsResponse)
                    .build();
        } catch (AppException e) {
            log.error("CRITICAL ERROR (AppException) during booking process for User ID {}: {}. ErrorCode: {}. Request: {}",
                userId, e.getMessage(), e.getErrorCode().getCode(), bookingRequest, e);
            throw e;
        } catch (Exception e) {
            log.error("CRITICAL UNEXPECTED ERROR during booking process for User ID {}: {}. Request: {}",
                userId, e.getMessage(), bookingRequest, e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Unexpected error occurred while creating booking: " + e.getMessage());
        } finally {
            log.info("========= END CREATE BOOKING PROCESS FOR USER ID: {} =========", userId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingDetails(Long bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

            Bill bill = billRepository.findByBooking(booking)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND, "Bill not found for booking ID: " + bookingId));

            Showtime showtime = booking.getShowtime();
            Schedule schedule = showtime.getSchedule();
            Room room = showtime.getRoom();
            Movie movie = schedule.getMovie();
            Branch branch = room.getBranch();

            List<String> seatLabels = booking.getShowtimeSeats().stream()
                    .map(seat -> seat.getSeat().getRowName() + seat.getSeat().getColumnName())
                    .collect(Collectors.<String>toList());

            List<BookingResponse.FoodItem> foodItemsResponse = new ArrayList<>();
            if (bill.getBillFoods() != null) {
                foodItemsResponse = bill.getBillFoods().stream()
                        .map(billFood -> BookingResponse.FoodItem.builder()
                                .name(billFood.getFood().getName())
                                .quantity(billFood.getQuantity())
                                .price(billFood.getFood().getPrice() * billFood.getQuantity())
                                .build())
                        .collect(Collectors.<BookingResponse.FoodItem>toList());
            }
            
            return BookingResponse.builder()
                    .bookingId(booking.getId())
                    .bookingCode(booking.getBookingCode())
                    .movie(BookingResponse.MovieInfo.builder()
                            .movieId(movie.getId())
                            .movieName(movie.getName())
                            .format(room.getRoomType())
                            .date(schedule.getDate())
                            .startTime(schedule.getTimeStart())
                            .endTime(schedule.getTimeStart().plusMinutes(movie.getDuration()))
                            .build())
                    .cinema(BookingResponse.CinemaInfo.builder()
                            .cinemaName(branch.getCinema().getName())
                            .roomName(room.getName())
                            .address(branch.getAddress())
                            .build())
                    .seats(seatLabels)
                    .totalAmount(booking.getTotalAmount())
                    .foodItems(foodItemsResponse)
                    .build();
        } catch (AppException e) {
            log.error("AppException in getBookingDetails: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Error getting booking details for bookingId {}: {}", bookingId, e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Error retrieving booking details");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingHistoryResponse> getUserBookingHistory(Long userId) {
        log.info("Fetching booking history for user ID: {}", userId);
        try {
            // Check if user exists
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        log.error("User not found with ID: {}", userId);
                        return new AppException(ErrorCode.USER_NOT_FOUND);
                    });
            log.debug("User found: {}", user.getEmail());

            // Find all bookings for this user with eager fetch of related entities
            List<Booking> bookings = bookingRepository.findByUserIdWithDetails(userId);
            log.info("Found {} bookings for user ID: {}", bookings.size(), userId);

            // Map Booking entities to BookingHistoryResponse DTOs
            return bookings.stream().map(booking -> {
                // Extract required data
                Showtime showtime = booking.getShowtime();
                Schedule schedule = showtime.getSchedule();
                Movie movie = schedule.getMovie();
                Room room = showtime.getRoom();
                Branch branch = room.getBranch();

                // Get seat labels
                List<String> seatLabels = booking.getShowtimeSeats().stream()
                        .map(showtimeSeat -> showtimeSeat.getSeat().getRowName() + showtimeSeat.getSeat().getColumnName())
                        .sorted()
                        .collect(Collectors.toList());

                // Bill-related data (if needed)
                List<BookingHistoryResponse.FoodItem> foodItems = new ArrayList<>();
                try {
                    Bill bill = billRepository.findByBooking(booking).orElse(null);
                    if (bill != null && bill.getBillFoods() != null) {
                        foodItems = bill.getBillFoods().stream()
                                .map(billFood -> BookingHistoryResponse.FoodItem.builder()
                                        .name(billFood.getFood().getName())
                                        .quantity(billFood.getQuantity())
                                        .price(billFood.getFood().getPrice())
                                        .build())
                                .collect(Collectors.<BookingHistoryResponse.FoodItem>toList());
                    }
                } catch (Exception e) {
                    log.warn("Could not retrieve food items for booking {}: {}", booking.getId(), e.getMessage());
                    // Continue without food items
                }

                // Build and return DTO
                return BookingHistoryResponse.builder()
                        .bookingId(booking.getId())
                        .bookingCode(booking.getBookingCode())
                        .bookingTime(booking.getBookingTime())
                        .totalAmount(booking.getTotalAmount())
                        .status(booking.getStatus())
                        .paymentMethod(booking.getPaymentMethod())
                        .paymentStatus(booking.getPaymentStatus())
                        .movie(BookingHistoryResponse.MovieInfo.builder()
                                .movieId(movie.getId())
                                .movieName(movie.getName())
                                .format(room.getRoomType().toString())
                                .date(schedule.getDate())
                                .startTime(schedule.getTimeStart())
                                .endTime(schedule.getTimeStart().plusMinutes(movie.getDuration()))
                                .build())
                        .cinema(BookingHistoryResponse.CinemaInfo.builder()
                                .cinemaName(branch.getCinema().getName())
                                .roomName(room.getName())
                                .address(branch.getAddress())
                                .build())
                        .seats(seatLabels)
                        .foodItems(foodItems)
                        .build();
            }).collect(Collectors.<BookingHistoryResponse>toList());
        } catch (AppException e) {
            log.error("Error getting booking history for user ID {}: {}", userId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error getting booking history for user ID {}: {}", userId, e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Error retrieving booking history");
        }
    }

    private String generateBookingCode() {
        return "MV" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}