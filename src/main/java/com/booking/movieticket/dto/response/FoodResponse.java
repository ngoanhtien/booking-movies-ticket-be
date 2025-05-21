package com.booking.movieticket.dto.response;

import com.booking.movieticket.entity.Food;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodResponse {
    private Long id;

    private String name;

    private double price;

    private int stock;

    private String imageUrl;

    private String description;

}
