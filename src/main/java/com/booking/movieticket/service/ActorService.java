package com.booking.movieticket.service;

import com.booking.movieticket.dto.criteria.ActorCriteria;
import com.booking.movieticket.dto.request.admin.update.ActorForUpdateRequest;
import com.booking.movieticket.dto.request.admin.create.ActorForCreateRequest;
import com.booking.movieticket.dto.response.admin.ActorResponse;
import com.booking.movieticket.entity.Actor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ActorService {

    Actor getActorById(Long id);

    Page<Actor> getAllActors(ActorCriteria actorCriteria, Pageable pageable);

    ActorResponse createActor(ActorForCreateRequest actorRequest);

    void updateActor(ActorForUpdateRequest actorRequest);

    void activateActor(Long id);

    void deactivateActor(Long id);
}
