package com.booking.movieticket.entity.enums;

public enum MembershipLevel {
    BASIC("Basic"),
    SILVER("Silver"),
    GOLD("Gold"),
    PLATINUM("Platinum"),
    DIAMOND("Diamond");

//    @JsonCreator
//    public static MembershipLevel fromString(String value) {
//        return MembershipLevel.valueOf(value.toUpperCase());
//    }

    private final String value;

    MembershipLevel(String value){
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
