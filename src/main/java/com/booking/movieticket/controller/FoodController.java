package com.booking.movieticket.controller;

import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.entity.Food;
import com.booking.movieticket.repository.FoodRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequestMapping("/foods")
@CrossOrigin(origins = "*")
public class FoodController {

    FoodRepository foodRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllFoods() {
        log.info("Getting all foods");
        List<Food> foods = foodRepository.findByIsDeletedFalse();
        return ResponseEntity.ok(new ApiResponse<>("Foods retrieved successfully", foods));
    }
}