package com.booking.movieticket.dto.response.admin;

import com.booking.movieticket.entity.Actor;
import com.booking.movieticket.entity.Category;
import com.booking.movieticket.entity.enums.StatusMovie;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieResponse {

    private Long id;
    private String name;
    private String summary;
    private String descriptionLong;
    private String director;
    private Integer ageLimit;
    private Integer duration;
    private LocalDate releasedDate;
    private String language;
    private String trailerUrl;
    private StatusMovie status;
    private Set<Category> categories = new HashSet<>();
    private Set<Actor> actors = new HashSet<>();
}
