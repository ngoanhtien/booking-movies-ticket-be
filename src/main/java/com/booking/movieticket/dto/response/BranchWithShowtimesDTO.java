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
public class BranchWithShowtimesDTO {
    private Long branchId;
    private String branchName;
    private String address;
    private String hotline;
    private String imageUrl;

    @Builder.Default
    private List<ShowtimeDTO> showtimes = new ArrayList<>();
}