package com.booking.movieticket.controller;

import com.booking.movieticket.dto.criteria.CategoryCriteria;
import com.booking.movieticket.dto.request.admin.update.CategoryForUpdateRequest;
import com.booking.movieticket.dto.request.admin.create.CategoryForCreateRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.admin.CategoryResponse;
import com.booking.movieticket.entity.Category;
import com.booking.movieticket.service.CategoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
@CrossOrigin(origins = "*")
@Validated
public class CategoryController {

    CategoryService categoryService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<Category>>> getAllCategories(CategoryCriteria categoryCriteria,
                                                                        @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Categories fetched successfully.", categoryService.getAllCategories(categoryCriteria, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategoryById(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>("Category details fetched successfully.", categoryService.getCategoryById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryForCreateRequest categoryRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>("Category created successfully.", categoryService.createCategory(categoryRequest)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<String>> updateCategory(@Valid @RequestBody CategoryForUpdateRequest categoryRequest) {
        categoryService.updateCategory(categoryRequest);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("Category updated successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> activateCategory(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        categoryService.activateCategory(id);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("Category activated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateCategory(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        categoryService.deactivateCategory(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Category deactivated successfully."));
    }
}
