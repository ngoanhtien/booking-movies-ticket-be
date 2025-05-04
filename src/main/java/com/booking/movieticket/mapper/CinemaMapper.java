package com.booking.movieticket.mapper;

import com.booking.movieticket.dto.request.admin.CinemaRequest;
import com.booking.movieticket.dto.response.admin.CinemaResponse;
import com.booking.movieticket.entity.Cinema;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CinemaMapper {
    Cinema toCinema(CinemaRequest request);

    void updateCinemaFromRequest(CinemaRequest request, @MappingTarget Cinema cinema);

    CinemaResponse toCinemaResponse(Cinema cinema);
}
