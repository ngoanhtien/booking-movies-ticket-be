package com.booking.movieticket.service.impl;

import com.booking.movieticket.entity.Food;
import com.booking.movieticket.repository.FoodRepository;
import com.booking.movieticket.service.FoodService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FoodServiceImpl implements FoodService {

    FoodRepository foodRepository;

    @Override
    public List<Food> listFoods() {
        return foodRepository.findByIsDeletedFalse();
    }
}
