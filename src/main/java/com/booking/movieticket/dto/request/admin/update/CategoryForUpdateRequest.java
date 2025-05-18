package com.booking.movieticket.dto.request.admin.update;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryForUpdateRequest {

    private Long id;

    @NotBlank(message = "Category name must not be blank.")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters.")
    private String name;

    private String description;
}
