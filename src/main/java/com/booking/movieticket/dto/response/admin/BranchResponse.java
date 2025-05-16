package com.booking.movieticket.dto.response.admin;

import com.booking.movieticket.dto.response.BaseResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchResponse extends BaseResponse {

    private Long id;
    private String name;
    private String imageUrl;
    private String address;
    private String hotline;
    private String description;
    private Long cinemaId;
    private String cinemaName;
}
