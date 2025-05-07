package com.booking.movieticket.controller;

import com.booking.movieticket.dto.criteria.ActorCriteria;
import com.booking.movieticket.dto.request.admin.update.ActorForUpdateRequest;
import com.booking.movieticket.dto.request.admin.create.ActorForCreateRequest;
import com.booking.movieticket.dto.response.ApiResponse;
import com.booking.movieticket.dto.response.admin.ActorResponse;
import com.booking.movieticket.entity.Actor;
import com.booking.movieticket.service.ActorService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/actor")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
@CrossOrigin(origins = "*")
@Validated
public class ActorController {

    ActorService actorService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<Actor>>> getAllActors(ActorCriteria actorCriteria,
                                                                 @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Actors fetched successfully.", actorService.getAllActors(actorCriteria, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Actor>> getActorById(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>("Actor details fetched successfully.", actorService.getActorById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ActorResponse>> createActor(@Valid @RequestBody ActorForCreateRequest actorRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>("Actor created successfully.", actorService.createActor(actorRequest)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<String>> updateActor(@Valid @RequestBody ActorForUpdateRequest actorRequest) {
        actorService.updateActor(actorRequest);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("Actor updated successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> activateActor(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        actorService.activateActor(id);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>("Actor activated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateActor(@PathVariable @Min(value = 1, message = "Id must be greater than or equal to 1.") Long id) {
        actorService.deactivateActor(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>("Actor deactivated successfully."));
    }
}
