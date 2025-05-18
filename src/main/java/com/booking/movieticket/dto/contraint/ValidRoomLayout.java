package com.booking.movieticket.dto.contraint;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = RoomLayoutValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidRoomLayout {
    String message() default "Invalid room layout configuration";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
