package com.booking.movieticket.entity;

import com.booking.movieticket.entity.enums.StatusPromotion;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "promotions")
@Getter
@Setter
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "promotion_id")
    private Long id;

    @Column(name = "info")
    private String info;

    @Column(name = "image_prom")
    private String imageUrl;

    @Column(name = "discount")
    private Double discount;

    @Column(name = "start_datetime")
    private LocalDateTime startDateTime;

    @Column(name = "end_datetime")
    private LocalDateTime endDateTime;

    @Column(name = "promotion_status")
    @Enumerated(EnumType.STRING)
    private StatusPromotion statusPromotion;

    @OneToMany(mappedBy = "promotion")
    @JsonIgnore
    private Set<Bill> bills;


}
