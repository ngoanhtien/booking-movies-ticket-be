package com.booking.movieticket.dto.request.admin.create;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CinemaForCreateRequest {

    @NotBlank(message = "Cinema name must not be blank.")
    @Size(min = 8, max = 225, message = "Cinema name must be between 8 and 225 characters.")
    private String name;

    @NotBlank(message = "Cinema hotline must not be blank.")
    @Pattern(regexp = "^\\+?[0-9. ()-]{7,25}$", message = "Invalid cinema hotline format.")
    private String hotline;

    private String description;
}
