package com.booking.movieticket.exception;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AppResponse extends RuntimeException {
    private AppCode appCode;

    public AppResponse(AppCode appCode) {
        super(appCode.getMessage());
        this.appCode = appCode;
    }
}