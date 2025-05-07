package com.booking.movieticket.service.impl;

import com.booking.movieticket.dto.criteria.ActorCriteria;
import com.booking.movieticket.dto.request.admin.update.ActorForUpdateRequest;
import com.booking.movieticket.dto.request.admin.create.ActorForCreateRequest;
import com.booking.movieticket.dto.response.admin.ActorResponse;
import com.booking.movieticket.entity.Actor;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.mapper.ActorMapper;
import com.booking.movieticket.repository.ActorRepository;
import com.booking.movieticket.repository.specification.ActorSpecificationBuilder;
import com.booking.movieticket.service.ActorService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ActorServiceImpl implements ActorService {
    ActorRepository actorRepository;
    ActorMapper actorMapper;

    @Override
    public Actor getActorById(Long id) {
        if (id == null) {
            throw new AppException(ErrorCode.ACTOR_NOT_FOUND);
        }
        return actorRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ACTOR_NOT_FOUND));
    }

    @Override
    public Page<Actor> getAllActors(ActorCriteria actorCriteria, Pageable pageable) {
        return actorRepository.findAll(ActorSpecificationBuilder.findByCriteria(actorCriteria), pageable);
    }

    @Override
    @Transactional
    public ActorResponse createActor(ActorForCreateRequest actorRequest) {
        Actor actor = actorMapper.convertRequestToActor(actorRequest);
        actor.setIsDeleted(false);
        return actorMapper.convertEntityToActorResponse(actorRepository.save(actor));
    }

    @Override
    @Transactional
    public void updateActor(ActorForUpdateRequest actorRequest) {
        if (actorRequest.getId() == null) {
            throw new AppException(ErrorCode.ACTOR_NOT_FOUND);
        }

        Actor actor = actorRepository.findById(actorRequest.getId())
                .orElseThrow(() -> new AppException(ErrorCode.ACTOR_NOT_FOUND));

        actorMapper.updateActorFromRequest(actorRequest, actor);
        actorRepository.save(actor);
    }

    @Override
    public void activateActor(Long id) {
        updateActorStatus(id, false);
    }

    @Override
    public void deactivateActor(Long id) {
        updateActorStatus(id, true);
    }

    private void updateActorStatus(Long id, boolean isDeleted) {
        if (id == null) {
            throw new AppException(ErrorCode.ACTOR_NOT_FOUND);
        }
        Actor actor = actorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACTOR_NOT_FOUND));
        if (Objects.equals(actor.getIsDeleted(), isDeleted)) {
            return;
        }
        actor.setIsDeleted(isDeleted);
        actorRepository.save(actor);
    }
}
