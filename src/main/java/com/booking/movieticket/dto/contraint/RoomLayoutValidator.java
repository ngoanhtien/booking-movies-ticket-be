package com.booking.movieticket.dto.contraint;

import com.booking.movieticket.dto.request.admin.create.RoomHasSeatsRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class RoomLayoutValidator implements ConstraintValidator<ValidRoomLayout, RoomHasSeatsRequest> {

    @Override
    public void initialize(ValidRoomLayout constraintAnnotation) {
    }

    @Override
    public boolean isValid(RoomHasSeatsRequest room, ConstraintValidatorContext context) {
        boolean isValid = true;

        // Disable default error message
        context.disableDefaultConstraintViolation();

        // Validate aisle position
        if (room.getAislePosition() != null && room.getSeatColumnNumbers() != null && room.getAisleWidth() != null && room.getAislePosition() >= (room.getSeatColumnNumbers() - room.getAisleWidth())) {

            context.buildConstraintViolationWithTemplate("Aisle position must be less than seatColumnNumbers - aisleWidth").addPropertyNode("aislePosition").addConstraintViolation();

            isValid = false;
        }

        // Validate aisle height
        if (room.getAisleHeight() != null && room.getSeatRowNumbers() != null && room.getAisleHeight() >= room.getSeatRowNumbers()) {

            context.buildConstraintViolationWithTemplate("Aisle height must be less than seatRowNumbers").addPropertyNode("aisleHeight").addConstraintViolation();

            isValid = false;
        }

        return isValid;
    }
}