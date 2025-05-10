package com.booking.movieticket.dto.request.admin.update;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchForUpdateRequest {

    @NotNull(message = "Branch ID must not be null.")
    private Long id;

    @NotBlank(message = "Branch name must not be blank.")
    @Size(min = 2, max = 100, message = "Branch name must be between 2 and 100 characters.")
    private String name;

    private String imageUrl;

    @NotBlank(message = "Branch address must not be blank.")
    @Size(max = 500, message = "Address cannot exceed 500 characters.")
    private String address;

    @NotBlank(message = "Branch hotline must not be blank.")
    @Pattern(regexp = "^\\+?[0-9. ()-]{7,25}$", message = "Invalid hotline format.")
    private String hotline;

    private String description;
}