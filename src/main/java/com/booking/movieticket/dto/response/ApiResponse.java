package com.booking.movieticket.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Builder
public class ApiResponse<T> {

    private Integer code;

    private String message;

    private T result;

    public ApiResponse(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public ApiResponse(String message) {
        this.message = message;
    }

    public ApiResponse(String message, T result) {
        this.message = message;
        this.result = result;
    }
}
