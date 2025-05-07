package com.booking.movieticket.mapper;

import com.booking.movieticket.dto.request.admin.update.MovieForUpdateRequest;
import com.booking.movieticket.dto.request.admin.create.MovieForCreateRequest;
import com.booking.movieticket.dto.response.admin.MovieResponse;
import com.booking.movieticket.entity.Actor;
import com.booking.movieticket.entity.Category;
import com.booking.movieticket.entity.Movie;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.repository.ActorRepository;
import com.booking.movieticket.repository.CategoryRepository;
import org.mapstruct.AfterMapping;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.HashSet;
import java.util.Set;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class, ActorMapper.class})
public interface MovieMapper {

    Movie toMovie(MovieForUpdateRequest movieRequest);

    Movie toMovie(MovieForCreateRequest movieRequest);

    MovieResponse toMovieResponse(Movie movie);

    @AfterMapping
    default void mapRelations(@MappingTarget Movie movie, MovieForCreateRequest movieRequest, @Context CategoryRepository categoryRepository, @Context ActorRepository actorRepository) {
        getActorsAndCategories(movie, categoryRepository, actorRepository, movieRequest.getCategoryIds(), movieRequest.getActorIds());
    }

    @AfterMapping
    default void mapRelations(@MappingTarget Movie movie, MovieForUpdateRequest movieRequest, @Context CategoryRepository categoryRepository, @Context ActorRepository actorRepository) {
        getActorsAndCategories(movie, categoryRepository, actorRepository, movieRequest.getCategoryIds(), movieRequest.getActorIds());
    }

    private void getActorsAndCategories(@MappingTarget Movie movie, @Context CategoryRepository categoryRepository, @Context ActorRepository actorRepository, Set<Long> categoryIds, Set<Long> actorIds) {
        if (categoryIds != null && !categoryIds.isEmpty()) {
            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(categoryIds));

            if (categories.size() != categoryIds.size()) {
                throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
            }

            movie.setCategories(categories);
        }

        if (actorIds != null && !actorIds.isEmpty()) {
            Set<Actor> actors = new HashSet<>(actorRepository.findAllById(actorIds));

            if (actors.size() != actorIds.size()) {
                throw new AppException(ErrorCode.ACTOR_NOT_FOUND);
            }

            movie.setActors(actors);
        }
    }
}
