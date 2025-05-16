package com.booking.movieticket.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class BaseResponse {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String createdBy;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant createdAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String lastModifiedBy;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant lastModifiedAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Boolean isDeleted;
}

