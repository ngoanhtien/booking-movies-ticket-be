package com.booking.movieticket.mapper;

import com.booking.movieticket.dto.response.FoodResponse;
import com.booking.movieticket.entity.Food;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FoodMapper {
    FoodResponse toFoodResponse(Food food);

    Food fromFoodResponse(FoodResponse foodResponse);
}
