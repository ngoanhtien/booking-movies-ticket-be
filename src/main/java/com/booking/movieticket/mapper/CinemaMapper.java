package com.booking.movieticket.mapper;


import com.booking.movieticket.dto.request.admin.CinemaRequest;
import com.booking.movieticket.dto.response.CinemaResponse;
import com.booking.movieticket.entity.Cinema;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CinemaMapper {
    Cinema toCinema(CinemaRequest request);

    CinemaResponse toCinemaResponse(Cinema cinema);
}
