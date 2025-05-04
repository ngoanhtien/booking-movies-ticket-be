package com.booking.movieticket.mapper;

import com.booking.movieticket.dto.request.admin.ActorRequest;
import com.booking.movieticket.dto.response.admin.ActorResponse;
import com.booking.movieticket.entity.Actor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ActorMapper {
    @Mapping(target = "movies", ignore = true)
    Actor toActor(ActorRequest request);

    void updateActorFromRequest(ActorRequest request, @MappingTarget Actor actor);

    ActorResponse toActorResponse(Actor actor);
}
