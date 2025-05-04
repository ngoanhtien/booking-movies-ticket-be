package com.booking.movieticket.mapper;

import com.booking.movieticket.dto.request.admin.ActorRequest;
import com.booking.movieticket.dto.request.admin.MovieRequest;
import com.booking.movieticket.dto.response.admin.MovieResponse;
import com.booking.movieticket.entity.Actor;
import com.booking.movieticket.entity.Category;
import com.booking.movieticket.entity.Movie;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.repository.ActorRepository;
import com.booking.movieticket.repository.CategoryRepository;
import org.mapstruct.*;

import java.util.HashSet;
import java.util.Set;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class, ActorMapper.class})
public interface MovieMapper {

    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "actors", ignore = true)
    @Mapping(target = "schedules", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    Movie toMovie(MovieRequest movieRequest);

    @AfterMapping
    default void mapRelations(@MappingTarget Movie movie, MovieRequest movieRequest,
                              @Context CategoryRepository categoryRepository,
                              @Context ActorRepository actorRepository) {
        if (movieRequest.getCategoryIds() != null && !movieRequest.getCategoryIds().isEmpty()) {
            Set<Category> categories = new HashSet<>(
                    categoryRepository.findAllById(movieRequest.getCategoryIds()));

            if (categories.size() != movieRequest.getCategoryIds().size()) {
                throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
            }

            movie.setCategories(categories);
        }

        if (movieRequest.getActorIds() != null && !movieRequest.getActorIds().isEmpty()) {
            Set<Actor> actors = new HashSet<>(
                    actorRepository.findAllById(movieRequest.getActorIds()));

            if (actors.size() != movieRequest.getActorIds().size()) {
                throw new AppException(ErrorCode.ACTOR_NOT_FOUND);
            }

            movie.setActors(actors);
        }
    }

    @Mapping(target = "categories", source = "categories")
    @Mapping(target = "actors", source = "actors")
    MovieResponse toMovieResponse(Movie movie);
}
