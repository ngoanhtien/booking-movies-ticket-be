package com.booking.movieticket.dto.criteria;

import com.booking.movieticket.entity.enums.StatusMovie;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MovieCriteria {

    private String searchTerm;
    private StatusMovie status;
}
