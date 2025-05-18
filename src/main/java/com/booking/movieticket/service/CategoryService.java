package com.booking.movieticket.service;

import com.booking.movieticket.dto.criteria.CategoryCriteria;
import com.booking.movieticket.dto.request.admin.create.CategoryForCreateRequest;
import com.booking.movieticket.dto.request.admin.update.CategoryForUpdateRequest;
import com.booking.movieticket.dto.response.admin.CategoryResponse;
import com.booking.movieticket.dto.response.admin.create.CategoryCreatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryService {

    CategoryResponse getCategoryById(Long id);

    Page<CategoryResponse> getAllCategories(CategoryCriteria categoryCriteria, Pageable pageable);

    CategoryCreatedResponse createCategory(CategoryForCreateRequest categoryRequest);

    void updateCategory(CategoryForUpdateRequest categoryRequest);

    void activateCategory(Long id);

    void deactivateCategory(Long id);
}
