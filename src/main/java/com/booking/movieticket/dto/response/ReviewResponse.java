package com.booking.movieticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long movieId;
    private String movieName;
    private Long userId;
    private String username;
    private Integer rating;
    private Integer likes;
    private String comment;
    private Instant createdAt;
}