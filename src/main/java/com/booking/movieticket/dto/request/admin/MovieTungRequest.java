package com.booking.movieticket.dto.request.admin;

import com.booking.movieticket.entity.enums.StatusMovie;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieTungRequest {

    private Long id;

    @NotBlank(message = "Movie name must not be blank.")
    @Size(min = 2, max = 225, message = "Movie name must be between 2 and 225 characters.")
    private String name;

    @NotBlank(message = "Movie summary must not be blank.")
    @Size(min = 10, max = 225, message = "Movie summary must be between 10 and 225 characters.")
    private String summary;

    @NotBlank(message = "Movie description must not be blank.")
    @Size(min = 20, message = "Movie description must be at least 20 characters.")
    private String descriptionLong;

    @NotBlank(message = "Movie director must not be blank.")
    @Size(min = 2, max = 225, message = "Movie director must be between 2 and 225 characters.")
    private String director;

    @NotNull(message = "Age limit must not be null.")
    @Min(value = 0, message = "Age limit must be at least 0.")
    @Max(value = 21, message = "Age limit cannot exceed 21.")
    private Integer ageLimit;

    @NotNull(message = "Duration must not be null.")
    @Min(value = 10, message = "Duration must be at least 10 minutes.")
    @Max(value = 300, message = "Duration cannot exceed 300 minutes.")
    private Integer duration;

    @NotNull(message = "Release date must not be null.")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Future(message = "Release date must be in the future.")
    private LocalDate releasedDate;

    @NotBlank(message = "Language must not be blank.")
    private String language;

    @URL(message = "Trailer URL must be valid.")
    private String trailerUrl;

    @NotNull(message = "Movie status must not be null.")
    private StatusMovie status;

    @URL(message = "Small image URL must be valid.")
    private String imageSmallUrl;

    @URL(message = "Large image URL must be valid.")
    private String imageLargeUrl;

    @NotEmpty(message = "At least one category must be selected.")
    private Set<Long> categoryIds;

    private Set<Long> actorIds;
}
