package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.request.BookingRequest;
import com.booking.movieticket.dto.response.BookingResponse;
import com.booking.movieticket.entity.*;
import com.booking.movieticket.entity.compositekey.BillFoodId;
import com.booking.movieticket.entity.compositekey.ShowtimeId;
import com.booking.movieticket.entity.enums.StatusBill;
import com.booking.movieticket.entity.enums.StatusSeat;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.repository.*;
import com.booking.movieticket.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest bookingRequest) {
        try {
            // Kiểm tra người dùng
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            // Kiểm tra showtime
            ShowtimeId showtimeId = new ShowtimeId(bookingRequest.getScheduleId(), bookingRequest.getRoomId());
            Showtime showtime = showtimeRepository.findById(showtimeId)
                    .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));

            Schedule schedule = showtime.getSchedule();
            Room room = showtime.getRoom();
            Movie movie = schedule.getMovie();
            Branch branch = room.getBranch();

            // Kiểm tra và lấy thông tin ghế
            List<ShowtimeSeat> selectedSeats = new ArrayList<>();
            double totalSeatPrice = 0.0;

            for (Long seatId : bookingRequest.getSeatIds()) {
                ShowtimeSeat showtimeSeat = showtimeSeatRepository.findById(seatId)
                        .orElseThrow(() -> new AppException(ErrorCode.SHOWTIMESEAT_NOT_FOUND));

                // Kiểm tra xem ghế có thuộc showtime không
                if (!showtimeSeat.getShowtime().getId().equals(showtimeId)) {
                    throw new AppException(ErrorCode.BAD_REQUEST, "Seat not in this showtime: " + seatId);
                }

                // Kiểm tra xem ghế đã được đặt chưa
                if (showtimeSeat.getStatus() != StatusSeat.AVAILABLE) {
                    throw new AppException(ErrorCode.BAD_REQUEST, "Seat already booked: " + seatId);
                }

                selectedSeats.add(showtimeSeat);
                totalSeatPrice += showtimeSeat.getPrice();
            }

            // Tạo Bill
            Bill bill = new Bill();
            bill.setUser(user);
            bill.setStatus(StatusBill.PAID);
            bill.setBillCode(generateBookingCode());
            bill.setIsDeleted(false);
            Bill savedBill = billRepository.save(bill);

            List<BookingResponse.FoodItem> foodItems = new ArrayList<>();
            double totalFoodPrice = 0.0;

            //Tính tiền đồ ăn
            if (bookingRequest.getFoodItems() != null) {
                for (BookingRequest.FoodOrderItem foodItem : bookingRequest.getFoodItems()) {
                    Food food = foodRepository.findById(foodItem.getFoodId())
                            .orElseThrow(() -> new AppException(ErrorCode.FOOD_NOT_FOUND));
                    Integer quantity = foodItem.getQuantity();
                    BillFood billFood = new BillFood();
                    billFood.setId(new BillFoodId(savedBill.getId(), food.getId()));
                    billFood.setBill(savedBill);
                    billFood.setFood(food);

                    billFood.setQuantity(quantity);
                    billFood.setIsDeleted(false);
                    savedBill.getBillFoods().add(billFood);

                    totalFoodPrice += food.getPrice() * quantity;
                    foodItems.add(BookingResponse.FoodItem.builder()
                            .name(food.getName())
                            .quantity(quantity)
                            .price(food.getPrice() * quantity)
                            .build());
                }
            }

            // Tạo BillDetail cho từng ghế
            for (ShowtimeSeat seat : selectedSeats) {
                BillDetail billDetail = new BillDetail();
                billDetail.setBill(savedBill);
                billDetail.setShowtimeSeat(seat);
                billDetail.setIsDeleted(false);

                // Cập nhật trạng thái ghế
                seat.setStatus(StatusSeat.BOOKED);
                showtimeSeatRepository.save(seat);

                savedBill.addBillDetail(billDetail);
            }

            billRepository.save(savedBill);

            // Tính tổng tiền
            double totalAmount = totalSeatPrice + totalFoodPrice;

            // Tạo response
            List<String> seatLabels = selectedSeats.stream()
                    .map(seat -> seat.getSeat().getRowName() + seat.getSeat().getColumnName())
                    .collect(Collectors.toList());


            return BookingResponse.builder()
                    .bookingId(savedBill.getId())
                    .bookingCode(savedBill.getBillCode())
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
                    .totalAmount(totalAmount)
                    .foodItems(foodItems)
                    .build();
        } catch (Exception e) {
            log.error("Error creating booking: {}", e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Error creating booking");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookingHistory(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            List<Bill> userBills = billRepository.findByUserIdOrderByCreatedAtDesc(userId);

            // Convert bills to BookingResponse objects
            return userBills.stream()
                    .map(this::convertBillToBookingResponse)
                    .collect(Collectors.toList());
        } catch (AppException e) {
            log.error("AppException getting user booking history: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error getting user booking history: {}", e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION,
                    "Error retrieving booking history for user: " + userId);
        }
    }

    // Helper method to convert Bill to BookingResponse
    private BookingResponse convertBillToBookingResponse(Bill bill) {
        // Similar logic to getBookingDetails method
        if (bill.getBillDetails().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Bill has no details");
        }

        // Get first bill detail to extract common information
        BillDetail firstBillDetail = bill.getBillDetails().iterator().next();
        ShowtimeSeat firstSeat = firstBillDetail.getShowtimeSeat();
        Showtime showtime = firstSeat.getShowtime();
        Schedule schedule = showtime.getSchedule();
        Room room = showtime.getRoom();
        Movie movie = schedule.getMovie();
        Branch branch = room.getBranch();

        // Get seat information
        List<String> seatLabels = bill.getBillDetails().stream()
                .map(detail -> detail.getShowtimeSeat().getSeat().getRowName() +
                        detail.getShowtimeSeat().getSeat().getColumnName())
                .collect(Collectors.toList());

        // Get food information
        List<BookingResponse.FoodItem> foodItems = bill.getBillFoods().stream()
                .map(billFood -> BookingResponse.FoodItem.builder()
                        .name(billFood.getFood().getName())
                        .quantity(billFood.getQuantity())
                        .price(billFood.getFood().getPrice() * billFood.getQuantity())
                        .build())
                .collect(Collectors.toList());

        // Calculate total amount
        double totalAmount = bill.getBillDetails().stream()
                .mapToDouble(detail -> detail.getShowtimeSeat().getPrice())
                .sum() +
                bill.getBillFoods().stream()
                        .mapToDouble(billFood -> billFood.getFood().getPrice() * billFood.getQuantity())
                        .sum();

        // Build and return BookingResponse
        return BookingResponse.builder()
                .bookingId(bill.getId())
                .bookingCode(bill.getBillCode())
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
                .totalAmount(totalAmount)
                .foodItems(foodItems)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingDetails(Long bookingId) {
        try {
            Bill bill = billRepository.findById(bookingId)
                    .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

            // Lấy thông tin từ bill
            BillDetail firstBillDetail = bill.getBillDetails().iterator().next();
            ShowtimeSeat firstSeat = firstBillDetail.getShowtimeSeat();
            Showtime showtime = firstSeat.getShowtime();
            Schedule schedule = showtime.getSchedule();
            Room room = showtime.getRoom();
            Movie movie = schedule.getMovie();
            Branch branch = room.getBranch();

            // Danh sách ghế
            List<String> seatLabels = bill.getBillDetails().stream()
                    .map(detail -> detail.getShowtimeSeat().getSeat().getRowName() +
                            detail.getShowtimeSeat().getSeat().getColumnName())
                    .collect(Collectors.toList());

            // Danh sách đồ ăn
            List<BookingResponse.FoodItem> foodItems = bill.getBillFoods().stream()
                    .map(billFood -> BookingResponse.FoodItem.builder()
                            .name(billFood.getFood().getName())
                            .quantity(billFood.getQuantity())
                            .price(billFood.getFood().getPrice() * billFood.getQuantity())
                            .build())
                    .collect(Collectors.toList());

            // Tính tổng tiền
            double totalAmount = bill.getBillDetails().stream()
                    .mapToDouble(detail -> detail.getShowtimeSeat().getPrice())
                    .sum() +
                    bill.getBillFoods().stream()
                            .mapToDouble(billFood -> billFood.getFood().getPrice() * billFood.getQuantity())
                            .sum();

            return BookingResponse.builder()
                    .bookingId(bill.getId())
                    .bookingCode(bill.getBillCode())
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
                    .totalAmount(totalAmount)
                    .foodItems(foodItems)
                    .build();
        } catch (Exception e) {
            log.error("Error getting booking details: {}", e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Error getting booking details");
        }
    }

    private String generateBookingCode() {
        return "MV" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}