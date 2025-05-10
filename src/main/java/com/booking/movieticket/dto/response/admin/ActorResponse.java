package com.booking.movieticket.dto.response.admin;

import com.booking.movieticket.entity.Movie;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActorResponse {

    private Long id;
    private String realName;
    private String actorName;
}
