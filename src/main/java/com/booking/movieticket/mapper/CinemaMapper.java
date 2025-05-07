package com.booking.movieticket.mapper;

import com.booking.movieticket.dto.request.admin.update.CinemaForUpdateRequest;
import com.booking.movieticket.dto.request.admin.create.CinemaForCreateRequest;
import com.booking.movieticket.dto.response.admin.CinemaResponse;
import com.booking.movieticket.entity.Cinema;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CinemaMapper {

    Cinema toCinema(CinemaForCreateRequest request);

    Cinema toCinema(CinemaForUpdateRequest request);

    void updateCinemaFromRequest(CinemaForUpdateRequest request, @MappingTarget Cinema cinema);

    CinemaResponse toCinemaResponse(Cinema cinema);
}
