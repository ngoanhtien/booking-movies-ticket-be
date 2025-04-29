package com.booking.movieticket.dto.response;

import com.booking.movieticket.entity.Schedule;
import com.booking.movieticket.entity.enums.StatusMovie;
import lombok.Getter;

import java.time.LocalDate;
import java.util.Set;

@Getter
public class CategoryResponse {
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

    private String imageSmallUrl;

    private String imageLargeUrl;

    private Set<Schedule> schedules;

//    private Set<Category> categories = new HashSet<>();
//
//    private Set<Review> reviews = new HashSet<>();
//
//    private Set<Actor> actors = new HashSet<>();
}
