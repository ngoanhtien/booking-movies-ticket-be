package com.booking.movieticket.mapper;


import com.booking.movieticket.dto.request.admin.ActorRequest;
import com.booking.movieticket.dto.request.admin.CategoryRequest;
import com.booking.movieticket.dto.response.admin.CategoryResponse;
import com.booking.movieticket.entity.Actor;
import com.booking.movieticket.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "movies", ignore = true)
    Category toCategory(CategoryRequest request);

    void updateCategoryFromRequest(CategoryRequest request, @MappingTarget Category category);

    CategoryResponse toCategoryResponse(Category category);
}
