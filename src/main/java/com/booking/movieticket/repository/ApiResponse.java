package com.booking.movieticket.repository;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private int code = 200;
    private String message;
    private T result;

    public ApiResponse(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
