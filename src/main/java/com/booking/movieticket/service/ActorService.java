package com.booking.movieticket.service;

import com.booking.movieticket.dto.criteria.ActorCriteria;
import com.booking.movieticket.dto.request.admin.create.ActorForCreateRequest;
import com.booking.movieticket.dto.request.admin.update.ActorForUpdateRequest;
import com.booking.movieticket.dto.response.admin.ActorResponse;
import com.booking.movieticket.dto.response.admin.create.ActorCreatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ActorService {

    ActorResponse getActorById(Long id);

    Page<ActorResponse> getAllActors(ActorCriteria actorCriteria, Pageable pageable);

    ActorCreatedResponse createActor(ActorForCreateRequest actorRequest);

    void updateActor(ActorForUpdateRequest actorRequest);

    void activateActor(Long id);

    void deactivateActor(Long id);
}
