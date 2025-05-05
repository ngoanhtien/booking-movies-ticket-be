package com.booking.movieticket.service;

import com.booking.movieticket.dto.criteria.CategoryCriteria;
import com.booking.movieticket.dto.request.admin.CategoryRequest;
import com.booking.movieticket.dto.response.admin.CategoryResponse;
import com.booking.movieticket.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryService {

    Category getCategoryById(Long id);

    Page<Category> getAllCategories(CategoryCriteria categoryCriteria, Pageable pageable);

    CategoryResponse createCategory(CategoryRequest categoryRequest);

    void updateCategory(CategoryRequest categoryRequest);

    void activateCategory(Long id);

    void deactivateCategory(Long id);
}
