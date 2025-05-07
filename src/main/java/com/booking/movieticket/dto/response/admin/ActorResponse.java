package com.booking.movieticket.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActorResponse {

    private Long id;
    private String realName;
    private String actorName;
}
