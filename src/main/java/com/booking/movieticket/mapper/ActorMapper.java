package com.booking.movieticket.mapper;

import com.booking.movieticket.dto.request.admin.update.ActorForUpdateRequest;
import com.booking.movieticket.dto.request.admin.create.ActorForCreateRequest;
import com.booking.movieticket.dto.response.admin.ActorResponse;
import com.booking.movieticket.entity.Actor;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ActorMapper {

    Actor convertRequestToActor(ActorForCreateRequest request);

    void updateActorFromRequest(ActorForUpdateRequest request, @MappingTarget Actor actor);

    ActorResponse convertEntityToActorResponse(Actor actor);
}
