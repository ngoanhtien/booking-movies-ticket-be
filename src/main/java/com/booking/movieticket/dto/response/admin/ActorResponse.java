package com.booking.movieticket.dto.response.admin;

import com.booking.movieticket.dto.response.BaseResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActorResponse extends BaseResponse {

    private Long id;
    private String realName;
    private String actorName;
}
