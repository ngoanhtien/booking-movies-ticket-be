package com.booking.movieticket.entity.enums;

public enum StatusMovie {
    SHOWING("Đang Chiếu"),
    UPCOMING("Sắp Chiếu"),
    STOPPED("Ngừng Chiếu");

    private final String displayName;

    StatusMovie(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
