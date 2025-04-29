package com.booking.movieticket.mapper;


import com.booking.movieticket.dto.request.admin.CategoryRequest;
import com.booking.movieticket.dto.response.CategoryResponse;
import com.booking.movieticket.entity.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    Category toCategory(CategoryRequest request);

    CategoryResponse toCategoryResponse(Category category);
}
