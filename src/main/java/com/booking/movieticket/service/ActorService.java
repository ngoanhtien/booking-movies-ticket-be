package com.booking.movieticket.service;

import com.booking.movieticket.dto.criteria.ActorCriteria;
import com.booking.movieticket.dto.request.admin.ActorRequest;
import com.booking.movieticket.dto.response.admin.ActorResponse;
import com.booking.movieticket.entity.Actor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ActorService {

    Actor getActorById(Long id);

    Page<Actor> getAllActors(ActorCriteria actorCriteria, Pageable pageable);

    ActorResponse createActor(ActorRequest actorRequest);

    void updateActor(ActorRequest actorRequest);

    void activateActor(Long id);

    void deactivateActor(Long id);
}
