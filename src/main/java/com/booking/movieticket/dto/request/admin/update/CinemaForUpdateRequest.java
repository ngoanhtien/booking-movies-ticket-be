package com.booking.movieticket.dto.request.admin.update;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CinemaForUpdateRequest {

    private Long id;

    @NotBlank(message = "Cinema name must not be blank.")
    @Size(min = 8, max = 225, message = "Cinema name must be between 8 and 225 characters.")
    private String name;

    @NotBlank(message = "Cinema hotline must not be blank.")
    @Pattern(regexp = "^\\+?[0-9. ()-]{7,25}$", message = "Invalid cinema hotline format.")
    private String hotline;

    @Size(max = 1000, message = "Description must not exceed 1000 characters.")
    private String description;

    @NotBlank(message = "Cinema address must not be blank.")
    @Size(min = 10, max = 500, message = "Address must be between 10 and 500 characters.")
    private String address;
}
