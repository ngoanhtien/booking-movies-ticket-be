package com.booking.movieticket.service.impl;

import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.service.CategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CategoryServiceImpl implements CategoryService {
    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;

    @Override
    public Category getCategoryById(Long id) {
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
    public void updateCategory(CategoryRequest categoryRequest) {
        Category categoryForUpdate = categoryMapper.toCategory(categoryRequest);
        if (categoryForUpdate.getId() == null) {
            throw new AppException(ErrorCode.CATEGORY_ID_NOT_FOUND);
        }
        Category category = categoryRepository.findById(categoryForUpdate.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Cập nhật các trường của category
        category.setName(categoryForUpdate.getName());
        category.setDescription(categoryForUpdate.getDescription());

        categoryRepository.save(category);
    }

    @Override
    public void activateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        category.setIsDeleted(false);
        categoryRepository.save(category);
    }

    @Override
    public void deactivateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        category.setIsDeleted(true); // Sửa bug: trước đây đang set false
        categoryRepository.save(category);
    }
}
