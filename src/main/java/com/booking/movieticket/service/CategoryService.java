package com.booking.movieticket.service;

import com.booking.movieticket.dto.criteria.CategoryCriteria;
import com.booking.movieticket.dto.request.admin.update.CategoryForUpdateRequest;
import com.booking.movieticket.dto.request.admin.create.CategoryForCreateRequest;
import com.booking.movieticket.dto.response.admin.CategoryResponse;
import com.booking.movieticket.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryService {

    Category getCategoryById(Long id);

    Page<Category> getAllCategories(CategoryCriteria categoryCriteria, Pageable pageable);

    CategoryResponse createCategory(CategoryForCreateRequest categoryRequest);

    void updateCategory(CategoryForUpdateRequest categoryRequest);

    void activateCategory(Long id);

    void deactivateCategory(Long id);
}
