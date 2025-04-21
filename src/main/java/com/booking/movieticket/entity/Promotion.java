package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import com.booking.movieticket.entity.enums.StatusPromotion;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "promotions")
@Getter
@Setter
public class Promotion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_promotion")
    @SequenceGenerator(name = "sequence_promotion")
    @Column(name = "promotion_id")
    private Long id;

    @Column(name = "info")
    private String info;

    @Column(name = "image_prom", columnDefinition = "TEXT")
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
    private Set<Bill> bills = new HashSet<>();

}
