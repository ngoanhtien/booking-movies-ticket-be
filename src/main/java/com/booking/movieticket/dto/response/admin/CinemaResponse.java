package com.booking.movieticket.dto.response.admin;

import com.booking.movieticket.dto.response.BaseResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CinemaResponse extends BaseResponse {
    private Long id;
    private String name;
    private String hotline;
    private String description;
    private String logoUrl;
    private String address;
}
