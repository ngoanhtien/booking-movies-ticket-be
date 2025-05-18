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

    @Column(name = "cinema_name", nullable = false)
    private String name;

    @Column(name = "hotline", nullable = false)
    private String hotline;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url", columnDefinition = "VARCHAR(1000)")
    private String logoUrl;

    @Column(name = "address")
    private String address;

    @OneToMany(mappedBy = "cinema", cascade = CascadeType.ALL)
    private Set<Branch> branches = new HashSet<>();
}
