package com.booking.movieticket.mapper;

import com.booking.movieticket.dto.request.admin.create.BranchForCreateRequest;
import com.booking.movieticket.dto.request.admin.update.BranchForUpdateRequest;
import com.booking.movieticket.dto.response.admin.BranchLocationDTO;
import com.booking.movieticket.dto.response.admin.BranchResponse;
import com.booking.movieticket.dto.response.admin.create.BranchCreatedResponse;
import com.booking.movieticket.entity.Branch;
import com.booking.movieticket.entity.Cinema;
import com.booking.movieticket.exception.AppException;
import com.booking.movieticket.exception.ErrorCode;
import com.booking.movieticket.repository.CinemaRepository;
import org.mapstruct.InjectionStrategy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {}, injectionStrategy = InjectionStrategy.CONSTRUCTOR)
public abstract class BranchMapper {

    @Autowired
    CinemaRepository cinemaRepository;

    @Mapping(source = "cinemaId", target = "java(getCinemaFromId(cinemaId)")
    public abstract Branch convertRequestToBranch(BranchForCreateRequest request);

    public abstract void updateBranchFromRequest(BranchForUpdateRequest request, @MappingTarget Branch branch);

    public abstract BranchCreatedResponse convertEntityToBranchCreatedResponse(Branch branch);

    @Mapping(source = "cinema.id", target = "cinemaId")
    @Mapping(source = "cinema.name", target = "cinemaName")
    public abstract BranchResponse convertEntityToBranchResponse(Branch branch);

    public abstract BranchLocationDTO convertEntityToBranchLocationDTO(Branch branch);

    public List<BranchLocationDTO> convertEntitiesToBranchLocationDTOs(List<Branch> branches) {
        if (branches == null) {
            return List.of();
        }
        return branches.stream()
                .map(this::convertEntityToBranchLocationDTO)
                .collect(Collectors.toList());
    }

    protected Cinema getCinemaFromId(Long cinemaId) {
        if (cinemaId == null) {
            return null;
        }
        return cinemaRepository.findById(cinemaId).orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
    }
}
