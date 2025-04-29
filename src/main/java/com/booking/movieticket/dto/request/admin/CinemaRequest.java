package com.booking.movieticket.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CinemaRequest {

    private Long id;

    @NotBlank(message = "Cinema name must not be blank.")
    @Size(min = 8, max = 225, message = "Cinema name must be between 8 and 225 characters.")
    private String name;

    @NotBlank(message = "Hotline must not be blank.")
    @Pattern(regexp = "^\\+?[0-9. ()-]{7,25}$", message = "Invalid hotline format.")
    private String hotline;

    private String description;

    @URL(message = "Invalid phone number format.")
    private String logoUrl;

    private Boolean isDeleted;
}
