package com.booking.movieticket.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cinema {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_cinema")
    @SequenceGenerator(name = "sequence_cinema")
    @Column(name = "cinema_id")
    private Long id;

    @Column(name = "cinema_name")
    private String name;

    @Column(name = "hotline")
    private String hotline;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_enabled")
    private Boolean isEnabled;
}
