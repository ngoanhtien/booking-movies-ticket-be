package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.criteria.CategoryCriteria;
import com.booking.movieticket.dto.request.admin.CategoryRequest;
import com.booking.movieticket.dto.response.admin.CategoryResponse;
import com.booking.movieticket.entity.Category;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.mapper.CategoryMapper;
import com.booking.movieticket.repository.CategoryRepository;
import com.booking.movieticket.repository.specification.CategorySpecificationBuilder;
import com.booking.movieticket.service.CategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CategoryServiceImpl implements CategoryService {
    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;

    @Override
    public Category getCategoryById(Long id) {
        if (id == null) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        return categoryRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
    }

    @Override
    public Page<Category> getAllCategories(CategoryCriteria categoryCriteria, Pageable pageable) {
        return categoryRepository.findAll(CategorySpecificationBuilder.findByCriteria(categoryCriteria), pageable);
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest categoryRequest) {
        Category category = categoryMapper.toCategory(categoryRequest);
        category.setIsDeleted(false);
        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void updateCategory(CategoryRequest categoryRequest) {
        if (categoryRequest.getId() == null) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        Category category = categoryRepository.findById(categoryRequest.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        categoryMapper.updateCategoryFromRequest(categoryRequest, category);
        categoryRepository.save(category);
    }

    @Override
    public void activateCategory(Long id) {
        updateCategoryStatus(id, false);
    }

    @Override
    public void deactivateCategory(Long id) {
        updateCategoryStatus(id, true);
    }

    private void updateCategoryStatus(Long id, boolean isDeleted) {
        if (id == null) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        if (Objects.equals(category.getIsDeleted(), isDeleted)) {
            return;
        }
        category.setIsDeleted(isDeleted);
        categoryRepository.save(category);
    }

}
