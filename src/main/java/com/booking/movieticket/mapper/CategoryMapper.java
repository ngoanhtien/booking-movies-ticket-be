package com.booking.movieticket.mapper;

import com.booking.movieticket.dto.request.admin.create.CategoryForCreateRequest;
import com.booking.movieticket.dto.request.admin.update.CategoryForUpdateRequest;
import com.booking.movieticket.dto.response.admin.CategoryResponse;
import com.booking.movieticket.dto.response.admin.create.CategoryCreatedResponse;
import com.booking.movieticket.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    Category convertRequestToCategory(CategoryForCreateRequest request);

    void updateCategoryFromRequest(CategoryForUpdateRequest request, @MappingTarget Category category);

    CategoryCreatedResponse convertEntityToCategoryCreatedResponse(Category category);

    CategoryResponse convertEntityToCategoryResponse(Category category);
}
