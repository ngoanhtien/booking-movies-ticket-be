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
public class BillController {

}