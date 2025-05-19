package com.booking.movieticket.dto.request.admin.update;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActorForUpdateRequest {

    private Long id;

    @NotBlank(message = "Actor real name must not be blank.")
    @Size(min = 2, max = 100, message = "Actor real name must be between 2 and 100 characters.")
    private String realName;

    @NotBlank(message = "Actor name must not be blank.")
    @Size(min = 2, max = 100, message = "Actor name must be between 2 and 100 characters.")
    private String actorName;
}
