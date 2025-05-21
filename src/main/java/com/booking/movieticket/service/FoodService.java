package com.booking.movieticket.service;

import com.booking.movieticket.dto.response.FoodResponse;
import com.booking.movieticket.entity.Food;

import java.util.List;

public interface FoodService {
    List<FoodResponse> listFoods();

    Food createFood(FoodResponse foodResponse);
}
