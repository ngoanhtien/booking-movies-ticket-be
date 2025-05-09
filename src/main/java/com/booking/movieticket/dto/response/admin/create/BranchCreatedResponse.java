package com.booking.movieticket.dto.response.admin.create;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchCreatedResponse {

    private Long id;
    private String name;
    private String imageUrl;
    private String address;
    private String hotline;
    private String description;
    private Long cinemaId;
    private String cinemaName;
}