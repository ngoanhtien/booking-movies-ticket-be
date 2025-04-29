package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "cinemas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cinema extends BaseEntity {

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

    @Column(name = "logo_url", columnDefinition = "VARCHAR(1000)")
    private String logoUrl;

    @OneToMany(mappedBy = "cinema")
    private Set<Branch> branches = new HashSet<>();
}
