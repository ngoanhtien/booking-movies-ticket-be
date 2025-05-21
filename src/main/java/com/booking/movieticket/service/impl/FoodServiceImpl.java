package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.response.FoodResponse;
import com.booking.movieticket.entity.Food;
import com.booking.movieticket.mapper.FoodMapper;
import com.booking.movieticket.repository.FoodRepository;
import com.booking.movieticket.service.FoodService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class FoodServiceImpl implements FoodService {

    FoodRepository foodRepository;
    FoodMapper foodMapper;

    @Override
    public List<FoodResponse> listFoods() {
        List<Food> foods = foodRepository.findByIsDeletedFalse();
        return foods.stream().map(foodMapper::toFoodResponse).collect(Collectors.toList());
    }

    @Override
    public Food createFood(FoodResponse foodResponse) {
        Food food = foodMapper.fromFoodResponse(foodResponse);
        return foodRepository.save(food);
    }
}
