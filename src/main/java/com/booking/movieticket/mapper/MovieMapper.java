package com.booking.movieticket.mapper;

import com.booking.movieticket.dto.request.admin.MovieTungRequest;
import com.booking.movieticket.dto.response.MovieResponse;
import com.booking.movieticket.entity.Movie;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MovieMapper {
    Movie toMovie(MovieTungRequest request);

    MovieResponse toMovieResponse(Movie movie);
}
