package com.booking.movieticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeResponse {
    private Long movieId;
    private String movieName;
    private String imageUrl;
    private Integer duration;
    private String summary;
    private String director;
    private Integer ageLimit;

    @Builder.Default
    private List<BranchWithShowtimesDTO> branches = new ArrayList<>();
}